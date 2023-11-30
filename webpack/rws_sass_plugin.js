const sass = require('sass');
const fs = require('fs');
const path = require('path');
const { getTokenSourceMapRange } = require('typescript');

const _COMPILE_DIR_NAME = 'inc';

const FONT_REGEX = /url\(['"]?(.+?\.(woff|woff2|eot|ttf|otf))['"]?\)/g;

const _DEV = true;

const log = (args) => {
  if(_DEV){
    console.log(args);
  }
}
class RWSSassPlugin {
  autoCompile = [];
  node_modules_dir = (fileDir) => path.relative(fileDir, process.cwd()) + '/node_modules/'

  constructor(params){
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

  extractCssImports(fileContent) {    
    const regex = /@import\s+['"](.+?\.css)['"];?/g;
    let match;
    const imports = [];
  
    while ((match = regex.exec(fileContent)) !== null) {      
      let importPath = match[1];
      // Convert to absolute path or handle it as required
      imports.push(importPath);
    }

    fileContent = fileContent.replace(regex, '');
  
    return [imports, fileContent];
  }

  extractScssImports(fileContent) {    
    const regex = /@import\s+['"](.+?\.scss)['"];?/g;
    let match;
    const imports = [];
  
    while ((match = regex.exec(fileContent)) !== null) {      
      let importPath = match[1];
      
      imports.push(importPath);
    }

    fileContent = fileContent.replace(regex, '');
  
    return [imports, fileContent];
  }

  replaceNodeModulesImport(fileContent, fileDir) {    
    const regex = /@import\s+['"](.+?\.scss)['"];?/g;        
    
    const resultCode = fileContent.replace(regex, (match, importPath) => {    
      return `@import "${path.join(this.node_modules_dir(fileDir), importPath)}";`;
    });
  
    return resultCode;
  }

  detectImports(code){
    const regex = /@import\s+['"](.+?\.(css|scss))['"];?/g;   
    return regex.test(code);
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

  getCodeFromFile(filePath){
    return fs.readFileSync(filePath, 'utf-8');
  }

  replaceWithNodeModules(input, fileDir, absolute = false, token = '~'){
    return input.replace(token, absolute ? `${path.resolve(process.cwd(), 'node_modules')}/` : this.node_modules_dir(fileDir));
  }

  compileFile(scssPath){
    if(scssPath.split('')[0] === '~'){
      scssPath = _self.replaceWithNodeModules(scssPath, path.dirname(scssPath));
    }

    let scssCode = this.getCodeFromFile(scssPath);  
    return this.compileCode(scssCode, path.dirname(scssPath));
  }

  processImports(imports, fileRootDir, importStorage = {}, sub = false){
    let finalCode = '';

    const getStorage = (sourceComponentPath, importedFileContent) => {
      const sourceComponentPathFormatted = sourceComponentPath.replace('/','_');

      if(!(sourceComponentPathFormatted in importStorage)){
        importStorage[sourceComponentPathFormatted] = importedFileContent;
        
        return importedFileContent;
      }      

      return '';
    } 

    imports.forEach(originalImportPath => {      
      let importPath = originalImportPath;  
      
      // log(`Processing '${importPath}' import in: ` + fileRootDir);  
      
      if(originalImportPath.split('')[0] === '~'){        
        importPath = this.replaceWithNodeModules(importPath, path.dirname(fileRootDir), true);         
      }

      // log(`Procesed '${importPath}' import to: ` + importPath);  
      importPath = path.resolve(fileRootDir, importPath);      
      
      const replacedScssContent = getStorage(importPath, this.getCodeFromFile(importPath).replace(/\/\*[\s\S]*?\*\//g, ''));      
          

      finalCode = replacedScssContent;

      let recursiveCode = '';      

      if(this.detectImports(finalCode)){
        recursiveCode = this.processImports(this.extractScssImports(finalCode)[0], fileRootDir, importStorage, true);    
        
       
      }            
      

      finalCode = recursiveCode + '\n' + finalCode;
      finalCode = this.deleteImports(finalCode);
       
    });

    return finalCode;
  }

  deleteImports(code = '')
  {
    const delregex = /@import\s+['"].+\.(scss|css)['"];\s*/g;
    return code.replace(delregex, '');
  }

  compileCode(scssCode, fileRootDir, createFile = false){    
    const _self = this;        
    
      // scssCode = this.replaceNodeModulesImport(scssCode, fileRootDir);  


      const [scssImports] = this.extractScssImports(scssCode);                    

      let dotest = false;

      if(fileRootDir.indexOf('chat-message') > -1){        
        dotest = true;
      }

      if(scssImports && scssImports.length){
        scssCode = this.deleteImports(scssCode);  
        scssCode = this.processImports(scssImports, fileRootDir) + scssCode;                       
      }

      try {

        // if(fileRootDir.indexOf('chat-message') > -1){
        //   log(`Processing 0 cnt '${fileRootDir}' import : \n`);
          
        //   console.log(scssCode);
        // }  

        const result = sass.compileString(scssCode, { loadPaths: [fileRootDir] })


        // if(fileRootDir.indexOf('chat-message') > -1){
        //   log(`Processing  cnt '${fileRootDir}' import : \n` + result.css);  
        // }

        let finalCss = result.css;
      
        // Check for CSS imports
        const [cssImports] = this.extractCssImports(scssCode); 
        
        if(cssImports && cssImports.length){
          // finalCss = this.processImports(cssImports, fileRootDir);        
        }
        
        cssImports.forEach(originalImportPath => {

          let importPath = originalImportPath;

          if(originalImportPath.split('')[0] === '~'){
            //console.warn(`RWS Sass compiler did not find '${importPath}' from '${module.resource}' looking inside node_modules...`);
            importPath = _self.replaceWithNodeModules(importPath, path.dirname(fileRootDir), true);

            if(!fs.existsSync(importPath)){
              throw new Error(`No ${importPath} found.`)
            }
          }

          finalCss = finalCss.replace(/@import\s+['"](.+?)['"]\s*;/g, '');
          
          const cssContent = _self.getCodeFromFile(importPath).replace(/\/\*[\s\S]*?\*\//g, '');              

          finalCss = cssContent + finalCss;

          if(_self.hasFontEmbeds()){
            finalCss = _self.embedFontsInCss(finalCss);
          }
        });

        // if(createFile){
        //   this.writeCssFile(scssPath, finalCss);
        // }      

        return finalCss;
      } catch(err) {
        console.error('SASS Error in', fileRootDir);
        // console.log(err);
        console.error(err);
        throw err;        
        return '';
      };    
  }
}

module.exports = RWSSassPlugin;
