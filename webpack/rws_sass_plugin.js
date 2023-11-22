const sass = require('sass');
const fs = require('fs');
const path = require('path');

const _COMPILE_DIR_NAME = 'inc';



class RWSSassPlugin {
  extractCssImports(filePath) {
    let fileContent = fs.readFileSync(filePath, 'utf8');
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
  
  writeCssFile(module, cssContent) {
    const cssFilePath = module.resource.replace('.scss', '.css');
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
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('RWSSassPlugin', (compilation) => {
      compilation.hooks.buildModule.tap('RWSSassPlugin', (module) => {
        if (module.resource && /\.scss$/.test(module.resource)) {        
          sass.compileAsync(module.resource, { }).then(result => {
            let finalCss = result.css;

            // Check for CSS imports
            const [cssImports] = this.extractCssImports(module.resource);                        

            cssImports.forEach(originalImportPath => {
              let importPath = originalImportPath;

              if(!fs.existsSync(importPath)){
                //console.warn(`RWS Sass compiler did not find '${importPath}' from '${module.resource}' looking inside node_modules...`);
                importPath = process.cwd() + '/node_modules/' + importPath;

                if(!fs.existsSync(importPath)){
                  throw new Error(`No ${importPath} found.`)
                }
              }

              finalCss = finalCss.replace(/@import\s+['"](.+?\.css)['"]\s*;/g, '');
              
              const cssContent = fs.readFileSync(importPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');              

              finalCss = cssContent + finalCss;
            });

            this.writeCssFile(module, finalCss);
          }).catch(err => {
            console.error(err);
          });
        }
      });
    });
  }
}

module.exports = RWSSassPlugin;
