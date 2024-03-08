const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const { spawn } = require('child_process');
const JSON5 = require('json5');

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

function findPackageDir()
{
  return path.resolve(path.dirname(module.id));
}

function getActiveWorkSpaces(currentPath, mode = 'all') { 
  if(!currentPath){
    throw new Error(`[_tools.js:getActiveWorkSpaces] "currentPath" argument is required.`);
  }

  if(!(['all', 'frontend', 'backend'].includes(mode))){
    throw new Error(`[_tools.js:getActiveWorkSpaces] "mode" argument can be only: "frontend", "backend" or "all".`);
  }

  const rootPkgDir = findRootWorkspacePath(currentPath)
  const parentPackageJsonPath = path.join(rootPkgDir, 'package.json');        
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return packageJson.workspaces.map((workspaceName) => path.join(rootPkgDir, workspaceName)).filter((workspaceDir) => {
        if(mode === 'all'){
          return true;
        }

        let rwsPkgName = 'rws-js-server';

        if(mode === 'frontend'){
          rwsPkgName = 'rws-js-client';
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

async function runCommand(command, cwd = null, silent = false, extraArgs = { env: {}}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    
    if(!cwd){
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

function findSuperclassFilePath(entryFile){
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

function findServiceFilesWithClassExtend(dir, classPath){
  const files = fs.readdirSync(dir);
  let results = []

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {  
      results = [...results, ...findServiceFilesWithClassExtend(filePath, classPath)];
    } else if (fileStat.isFile() && filePath.endsWith('.ts')) {  
      const foundPath = findSuperclassFilePath(filePath);          
      if(foundPath === classPath){
        results = [...results, filePath];
      }
    };
  });

  return results;
}

function findComponentFilesWithText(dir, text, ignored = [], fileList = []){
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory() && !ignored.includes(file)) {
      // Recursively search this directory
      findComponentFilesWithText(filePath, text, ignored, fileList);
    } else if (fileStat.isFile() && filePath.endsWith('.ts')) {    
      // Read file content and check for text
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(text)) {                
        const compInfo = extractComponentInfo(content);
        if(compInfo){
          const {tagName, className, options, isIgnored} = compInfo;

          if(isIgnored){
            return;
          }

          // const fileParts = filePath.split('/');
          // const fpLen = fileParts.length;          

          fileList.push({
            filePath,
            tagName,
            className,
            sanitName: className.toLowerCase(),
            content,
            isIgnored: options?.ignorePackaging
          });
        }
      }
    }
  });

  return fileList;
}

function extractRWSViewArguments(sourceFile){
  let argumentsExtracted = {
      className: null,
      tagName: null,
      options: null        
  };

  let foundDecorator = false;
 
  function visit(node) {
      if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
          const expression = node.expression;
          const decoratorName = expression.expression.getText(sourceFile);
          if (decoratorName === 'RWSView') {
              foundDecorator = true;
              const args = expression.arguments;
              if (args.length > 0 && ts.isStringLiteral(args[0])) {
                argumentsExtracted.tagName = args[0].text;                    
              }
              if (args.length > 1) {                  
                  if (ts.isObjectLiteralExpression(args[1])) {
                    const argVal = args[1].getText(sourceFile);                    
                    argumentsExtracted.options = JSON5.parse(argVal);
                  }
              } 
              
              if (node.parent && ts.isClassDeclaration(node.parent)) {
                const classNode = node.parent;
                if (classNode.name) { // ClassDeclaration.name is optional as classes can be unnamed/anonymous
                  argumentsExtracted.className = classNode.name.getText(sourceFile);
                }
              }
          }
      }

      ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if(!foundDecorator){
    return null;
  }

  return argumentsExtracted;
}

function extractRWSIgnoreArguments(sourceFile){
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

                      if(argVal.ignorePackaging === true){
                        ignored = true;
                      }
                  }
              }                
          }
      }

      ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if(!foundDecorator){
    return true;
  }

  return ignored;
}

function extractComponentInfo(componentCode) {
  const componentNameRegex = /\@RWSView/g;
  
  if(!componentNameRegex.test(componentCode)){
    return;
  }

  const tsSourceFile = ts.createSourceFile(`/tmp/temp_ts`, componentCode, ts.ScriptTarget.Latest, true);

  let decoratorArgs = extractRWSViewArguments(tsSourceFile);

  if(!decoratorArgs){
    decoratorArgs = {};
  }

  decoratorOpts = decoratorArgs.options;  

  return {...decoratorArgs, options: decoratorOpts };
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
    findSuperclassFilePath
}