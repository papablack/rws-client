const sass = require('sass');
const fs = require('fs');
const path = require('path');
const { getTokenSourceMapRange } = require('typescript');
const _tools = require('../_tools');
const _COMPILE_DIR_NAME = 'compiled';

const FONT_REGEX = /url\(['"]?(.+?\.(woff|woff2|eot|ttf|otf))['"]?\)/gm;
const CSS_IMPORT_REGEX = /@import\s+['"]((?![^'"]*:[^'"]*).+?)['"];?/gm
const SCSS_USE_REGEX = /@use\s+['"]?([^'"\s]+)['"]?;?/gm;
const _DEV = true;

const log = (args) => {
  if(_DEV){
    console.log(args);
  }
}
class RWSPlugin {
  autoCompile = [];

  constructor(params){
    this.node_modules_dir = (fileDir) => path.relative(fileDir, _tools.findRootWorkspacePath(process.cwd())) + '/node_modules/'
    
    if(!params){
      params = {};
    }

    if(!!params.autoCompile && params.autoCompile.length > 0){
      this.autoCompile = params.autoCompile;
    }

    for (let index in this.autoCompile){
      const sassFile = this.autoCompile[index];
      this.compileFile(sassFile, true);
    }
  }

  extractScssImports(fileContent) {      
    let match;
    const imports = [];
  
    while ((match = CSS_IMPORT_REGEX.exec(fileContent)) !== null) {        
      const importPath = match[1];
      const importLine = match[0];
      
      imports.push([importPath, importLine]);
    }    
  
    return [imports, fileContent];
  }

  extractScssUses(fileContent) {      
    let match;
    const uses = [];
  
    while ((match = SCSS_USE_REGEX.exec(fileContent)) !== null) {        
      const usesPath = match[1];
      const usesLine = match[0];
      
      uses.push([usesPath, usesLine]);
    }    
  
    return [uses];
  }

  detectImports(code){        
    return CSS_IMPORT_REGEX.test(code);
  }
  
  writeCssFile(scssFilePath, cssContent) {    
    const cssFilePath = scssFilePath.replace('.scss', '.css');
    let endCssFilePath = cssFilePath.split('/');
    let endCssDir = [...endCssFilePath];
    endCssDir[endCssDir.length - 1] = `${_COMPILE_DIR_NAME}`;
    endCssDir = endCssDir.join('/');
  
    if (!fs.existsSync(endCssDir)) {
      fs.mkdirSync(endCssDir);
    }
  
    endCssFilePath[endCssFilePath.length - 1] = `${_COMPILE_DIR_NAME}/` + endCssFilePath[endCssFilePath.length - 1];
    endCssFilePath = endCssFilePath.join('/');
  
    fs.writeFileSync(endCssFilePath, cssContent);
    log('Saved CSS file: ' + endCssFilePath);  
  }

  hasFontEmbeds(css){
    return FONT_REGEX.test()
  }

  embedFontsInCss(css, cssFilePath) {    
    let match;

    while ((match = FONT_REGEX.exec(css)) !== null) {
      const fontPath = match[1];
      const absoluteFontPath = path.resolve(path.dirname(cssFilePath), fontPath);

      if (fs.existsSync(absoluteFontPath)) {
        const fontData = fs.readFileSync(absoluteFontPath);
        const base64Font = fontData.toString('base64');
        const fontMimeType = this.getFontMimeType(path.extname(absoluteFontPath));
        const fontDataURL = `data:${fontMimeType};base64,${base64Font}`;

        css = css.replace(new RegExp(match[0], 'g'), `url(${fontDataURL})`);
      }
    }

    return css;
  }

  getFontMimeType(extension) {
    switch (extension) {
      case '.woff': return 'font/woff';
      case '.woff2': return 'font/woff2';
      case '.eot': return 'application/vnd.ms-fontobject';
      case '.ttf': return 'font/ttf';
      case '.otf': return 'font/otf';
      default: return 'application/octet-stream';
    }
  }

  apply(compiler) {
    const _self = this;

    return;

    compiler.hooks.thisCompilation.tap('RWSSassPlugin', (compilation) => {
      compilation.hooks.buildModule.tap('RWSSassPlugin', (module) => {
        if (module.resource && /\.scss$/.test(module.resource)) {       
          
          let scssPath = module.resource;   

          this.compileFile(scssPath, true).catch((e) => {
            throw e;
          })
        }
      });
    });
  }

 readSCSSFilesFromDirectory(dirPath) {
    let scssFiles = [];
  
    try {
      const files = fs.readdirSync(dirPath);
  
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
  
        if (stat.isFile() && path.extname(file) === '.scss') {
          scssFiles.push(filePath);
        } else if (stat.isDirectory()) {
          scssFiles = scssFiles.concat(readSCSSFilesFromDirectory(filePath));
        }
      });
    } catch (e) {
      console.error(`Failed to read directory ${dirPath}:`, e);
    }
  
    return scssFiles;
  };
  

  getCodeFromFile(filePath){
    filePath = filePath.replace('//', '/');   
    
    const fileStat = fs.statSync(filePath);

    if(!fs.existsSync(filePath)){
      throw new Error(`SCSS loader: File path "${filePath}" was not found.`);
    }

    if(filePath[filePath.length - 1] === '/' && fs.statSync(filePath).isDirectory()){
      let collectedCode = '';

      this.readSCSSFilesFromDirectory(filePath).forEach(scssPath => {
        collectedCode += fs.readFileSync(scssPath, 'utf-8');
      });

      return collectedCode;
    }else if(fs.statSync(filePath).isDirectory()){
        throw new Error(`Non-directory path (not ending with "/") "${filePath}" is and should not be a directory`)
    }    

    return fs.readFileSync(filePath, 'utf-8');
  }

  replaceWithNodeModules(input, fileDir, absolute = false, token = '~'){
    return input.replace(token, absolute ? `${path.resolve(_tools.findRootWorkspacePath(process.cwd()), 'node_modules')}/` : this.node_modules_dir(fileDir));
  }

  compileFile(scssPath){
    scssPath = this.processImportPath(scssPath, path.dirname(scssPath))

    let scssCode = this.getCodeFromFile(scssPath);  

    return this.compileScssCode(scssCode, path.dirname(scssPath));
  }

  processImports(imports, fileRootDir, importStorage = {}, sub = false){
    const importResults = [];

    const getStorage = (sourceComponentPath, importedFileContent) => {
      const sourceComponentPathFormatted = sourceComponentPath.replace('/','_');

      if(!(sourceComponentPathFormatted in importStorage)){
        importStorage[sourceComponentPathFormatted] = importedFileContent;
        
        return importedFileContent;
      }      

      return '';
    } 

    imports.forEach(importData => {                    
      const originalImportPath = importData[0];
      let importPath = this.processImportPath(originalImportPath, fileRootDir);      
      let replacedScssContent = getStorage(importPath, this.getCodeFromFile(importPath).replace(/\/\*[\s\S]*?\*\//g, '')); 

      const recursiveImports = this.extractScssImports(replacedScssContent)[0];

      if(recursiveImports.length){           
        
        replacedScssContent = this.replaceImports(this.processImports(recursiveImports, path.dirname(importPath), importStorage, true), replacedScssContent);              
      }        
      
      importResults.push({
        line: importData[1],
        code: replacedScssContent
      });            
    });    

    return importResults;
  }

  replaceImports(processedImports, code){
    processedImports.forEach(importObj => {          
      code = code.replace(importObj.line, importObj.code);
    });
  
    return code;
  }

  processImportPath(importPath, fileRootDir){
    const cwdRequest = importPath.indexOf('@cwd');

    if(importPath.split('')[0] === '~'){      
      return this.fillSCSSExt(this.replaceWithNodeModules(importPath, path.dirname(fileRootDir), true));         
    } else if ( cwdRequest > -1){      
      return this.fillSCSSExt(process.cwd() + '/' + importPath.slice(cwdRequest+4));
    }    

    if(importPath.split('')[0] === '/'){
      return this.fillSCSSExt(importPath);  
    }

    if(importPath.split('')[0] === '.'){
      return this.fillSCSSExt(path.resolve(fileRootDir, importPath));
    }

    const relativized = path.resolve(fileRootDir) + '/' + importPath;

    if(!fs.existsSync(relativized)){
      const partSplit = relativized.split('/');
      partSplit[partSplit.length-1] = '_' + partSplit[partSplit.length-1] + '.scss';

      const newPath = partSplit.join('/');

      if(fs.existsSync(newPath)){
        return newPath;
      }      
    }

    return this.fillSCSSExt(relativized);
  }

  fillSCSSExt(scssPath){
    if((!fs.existsSync(scssPath) || (fs.existsSync(scssPath) && fs.statSync(scssPath).isDirectory())) && fs.existsSync(`${scssPath}.scss`)){
      return `${scssPath}.scss`;
    }

    if(fs.existsSync(`_${scssPath}.scss`)){
      return `${scssPath}.scss`;
    }

    return scssPath;
  }

  compileScssCode(scssCode, fileRootDir, createFile = false, filePath = null, minify = false){
    const _self = this;                  
      const [scssImports] = this.extractScssImports(scssCode);                         

      if(scssImports && scssImports.length){                
        scssCode = this.replaceImports(this.processImports(scssImports, fileRootDir), scssCode);                       
      }

      const uses = this.extractScssUses(scssCode)[0];
      let scssUses = '';
    

      uses.forEach(scssUse => {
        const useLine = scssUse[1];
        scssUses += useLine + '\n'; 
        scssCode = scssCode.replace(useLine, '');
      });       
  
      scssCode = scssUses + scssCode;      

      try {

        const result = sass.compileString(scssCode, { loadPaths: [fileRootDir], style: minify ? 'compressed' : 'expanded' });
        let finalCss = result.css;               

        return finalCss;
      } catch(err) {
        console.error('SASS Error in', fileRootDir);
        // console.log(err);
        console.error(err);
        throw err;        
        return '';
      };    
  }

  checkForImporterType(_module, checkTypeExt){
    let importingFileExtension = '';

    if (_module && _module.issuer && _module.issuer.resource) {
        importingFileExtension = path.extname(_module.issuer.resource);
        if(importingFileExtension === ('.' + checkTypeExt)){
            return true;
        }
    }else{
        return false;
    }

    return false
  }
}

module.exports = RWSPlugin;
