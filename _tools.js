const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const { spawn } = require('child_process');
const JSON5 = require('json5');

const { setupTsConfig } = require('./cfg/tsconfigSetup');
const LoadersHelper = require('./cfg/build_steps/webpack/_loaders');

const { rwsPath } = require('@rws-framework/console');

function findRootWorkspacePath(currentPath) {
  const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return this.findRootWorkspacePath(parentPackageDir);
    }
  }

  return currentPath;
}

function findPackageDir() {
  return path.resolve(path.dirname(module.id));
}

function getActiveWorkSpaces(currentPath, mode = 'all') {
  if (!currentPath) {
    throw new Error(`[_tools.js:getActiveWorkSpaces] "currentPath" argument is required.`);
  }

  if (!(['all', 'frontend', 'backend'].includes(mode))) {
    throw new Error(`[_tools.js:getActiveWorkSpaces] "mode" argument can be only: "frontend", "backend" or "all".`);
  }

  const rootPkgDir = findRootWorkspacePath(currentPath)
  const parentPackageJsonPath = path.join(rootPkgDir, 'package.json');
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return packageJson.workspaces.map((workspaceName) => path.join(rootPkgDir, workspaceName)).filter((workspaceDir) => {
        if (mode === 'all') {
          return true;
        }

        let rwsPkgName = '@rws-framework/server';

        if (mode === 'frontend') {
          rwsPkgName = '@rws-framework/client';
        }

        let hasDesiredPackage = false;

        const workspaceWebpackFilePath = path.join(workspaceDir, 'package.json');
        const workspacePackageJson = JSON.parse(fs.readFileSync(workspaceWebpackFilePath, 'utf-8'));

        if (workspacePackageJson.dependencies && (!!workspacePackageJson.dependencies[rwsPkgName])) {
          hasDesiredPackage = true;
        }

        return hasDesiredPackage;
      });
    }
  }

  return [currentPath];
}

async function runCommand(command, cwd = null, silent = false, extraArgs = { env: {} }) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');

    if (!cwd) {
      console.log(`[RWS] Setting default CWD for "${command}"`);
      cwd = process.cwd();
    }


    const env = { ...process.env, ...extraArgs.env };

    console.log(`[RWS] Running command "${command}" from "${cwd}"`);

    const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd, env });

    spawned.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`Command failed with exit code ${code}`));
      }
      resolve();
    });

    spawned.on('error', (error) => {
      reject(error);
    });
  });
}

function findSuperclassFilePath(entryFile) {
  const program = ts.createProgram([entryFile], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
  });
  const checker = program.getTypeChecker();

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  }

  function visit(node) {
    if (ts.isClassDeclaration(node) && node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          for (const type of clause.types) {
            const symbol = checker.getSymbolAtLocation(type.expression);
            if (symbol && symbol.declarations) {
              const declaration = symbol.declarations[0];
              const sourceFile = declaration.getSourceFile();
              return sourceFile.fileName; // Returns the file path of the first superclass it finds
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  return null; // Return null if no superclass or file path is found
}

function findServiceFilesWithClassExtend(dir, classPath) {
  const files = fs.readdirSync(dir);
  let results = []

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      results = [...results, ...findServiceFilesWithClassExtend(filePath, classPath)];
    } else if (fileStat.isFile() && filePath.endsWith('.ts')) {
      const foundPath = findSuperclassFilePath(filePath);
      if (foundPath === classPath) {
        results = [...results, filePath];
      }
    };
  });

  return results;
}

function findComponentFilesWithText(dir, text, ignored = [], fileList = []) {
  const files = fs.readdirSync(dir);


  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory() && !ignored.includes(file)) {
      findComponentFilesWithText(filePath, text, ignored, fileList);
    } else if (fileStat.isFile() && filePath.endsWith('component.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(text)) {        
        try {
        const compInfo = extractComponentInfo(content);  

        if (compInfo) {
      
          const { tagName, className, options } = compInfo;

          if (options?.ignorePackaging) {
            return;
          }

          fileList.push({
            filePath,
            tagName,
            className,
            sanitName: className.toLowerCase(),
            content,
            isDebugged: options?.debugPackaging,
            isIgnored: options?.ignorePackaging,
            isOreo: options?.oreoMode
          });
          
        }
        }catch(e){
          console.log('ERRORER', e);
          throw new Error(`findComponentFilesWithText('${dir}', '${text}') error`)
        }
      }
    }
  });

  return fileList;
}


function extractRWSViewArguments(sourceFile) {
  let argumentsExtracted = {
    className: null,
    tagName: null,
    options: null
  };

  let foundDecorator = false;
  let className = null;
  function visit(node) {  
    if (ts.isClassDeclaration(node)) {
      className = node.name ? node.name.getText(sourceFile) : null;
    }

    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const expression = node.expression;
      const decoratorName = expression.expression.getText(sourceFile);      

      if (decoratorName === 'RWSView') {
 
        argumentsExtracted.className = className;
 

        foundDecorator = true;
        const args = expression.arguments;
        let tagName = null;
        let options = null;

        if (args.length > 0 && ts.isStringLiteral(args[0])) {
          tagName = args[0].text;
          argumentsExtracted.tagName = tagName;
        }

        if (args.length > 1 && ts.isObjectLiteralExpression(args[1])) {
          const argText = args[1].getText();
          options = JSON5.parse(argText);
          argumentsExtracted.options = options;          
        }
       
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (!foundDecorator) {
    return null;
  }

  return argumentsExtracted;
}

function extractRWSIgnoreArguments(sourceFile) {
  let argumentsExtracted = {
    params: null,
  };
  let foundDecorator = false;
  let ignored = false;

  function visit(node) {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const expression = node.expression;
      const decoratorName = expression.expression.getText(sourceFile);
      if (decoratorName === 'RWSView') {
        foundDecorator = true;
        const args = expression.arguments;

        if (args.length) {
          // Assuming the second argument is an object literal
          if (ts.isObjectLiteralExpression(args[0])) {
            const argVal = args[0].getText(sourceFile);
            argumentsExtracted.options = argVal;

            if (argVal.ignorePackaging === true) {
              ignored = true;
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (!foundDecorator) {
    return true;
  }

  return ignored;
}

function extractComponentInfo(componentCode) {
  const decoratorData = LoadersHelper.extractRWSViewArgs(componentCode, true);

  if(!decoratorData){
    return null;
  }
  // console.log(decoratorData, componentCode);

  return { 
    tagName: decoratorData.viewDecoratorData.tagName, 
    className: decoratorData.viewDecoratorData.className, 
    options: decoratorData.viewDecoratorData.decoratorArgs
  };
}

function getAllFilesInFolder(folderPath, ignoreFilenames = [], recursive = false) {
  const files = [];
  function traverseDirectory(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    entries.forEach(entry => {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isFile()) {
        let pass = true;
        ignoreFilenames.forEach((regEx) => {
          if (regEx.test(entryPath)) {
            pass = false;
          }
        });
        if (pass) {
          files.push(entryPath);
        }
      }
      else if (entry.isDirectory() && recursive) {
        traverseDirectory(entryPath);
      }
    });
  }
  traverseDirectory(folderPath);
  return files;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function printAddJs(scriptFileName, partedDirUrlPrefix, partedPrefix, onload = ''){
  const sriptVarName = 'script' + getRndInteger(0, 1000);
  return `  
    const ${sriptVarName} = document.createElement('script');
    ${sriptVarName}.src = '${partedDirUrlPrefix}/${partedPrefix}.${scriptFileName}.js';        
    ${sriptVarName}.type = 'text/javascript';    

    document.body.appendChild(${sriptVarName});

    ${onload}     
  `
}

function getPartedModeVendorsBannerParams(partedDirUrlPrefix, partedPrefix, isDev = true) {
  let code = `if(!window.RWS_PARTS_LOADED){
    ${printAddJs('vendors', partedDirUrlPrefix, partedPrefix, `
      window.RWS_PARTS_LOADED = true;
      console.log('\x1b[1m[RWS]\x1b[0m', 'vendors injected for parted mode');       
    `)}
  }`;

  if(!isDev){
    code = code.replace(/\n\s+/g, '');
  }

  return {
    banner: code,
    raw: true,
    entryOnly: true,
    include: `${partedPrefix}.client.js`
  };
}


module.exports = {
  findRootWorkspacePath,
  findPackageDir,
  getActiveWorkSpaces,
  runCommand,
  findComponentFilesWithText,
  extractComponentInfo,
  extractRWSViewArguments,
  extractRWSIgnoreArguments,
  findServiceFilesWithClassExtend,
  findSuperclassFilePath,
  getAllFilesInFolder,
  setupTsConfig,
  getPartedModeVendorsBannerParams
}