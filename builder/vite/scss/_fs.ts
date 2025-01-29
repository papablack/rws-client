const fs = require('fs');
const path = require('path');

import _scss_import from './_import';
const _COMPILE_DIR_NAME = 'compiled';


function writeCssFile(scssFilePath, cssContent) {
    const cssFilePath = scssFilePath.replace('.scss', '.css');
    let endCssFilePath = cssFilePath.split('/');
    let endCssDirVars: string[] = [...endCssFilePath];
    endCssDirVars[endCssDirVars.length - 1] = `${_COMPILE_DIR_NAME}`;
    const endCssDir: string = endCssDirVars.join('/');

    if (!fs.existsSync(endCssDir)) {
      fs.mkdirSync(endCssDir);
    }

    endCssFilePath[endCssFilePath.length - 1] = `${_COMPILE_DIR_NAME}/` + endCssFilePath[endCssFilePath.length - 1];
    endCssFilePath = endCssFilePath.join('/');

    fs.writeFile(endCssFilePath, cssContent, () => {});
    console.log('Saved external CSS file in: ' + endCssFilePath);
}

function readSCSSFilesFromDirectory(dirPath) {
    let scssFiles: string[] = [];

    try {
      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const filePath: string = path.join(dirPath, file);
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


  function getCodeFromFile(filePath) {
    filePath = filePath.replace(/\/\//g, path.sep);        
    filePath = filePath.replace(/\\/g, path.sep);

    if (!fs.existsSync(filePath)) {
      const processedImportPath = _scss_import(this).processImportPath(filePath, path.dirname(filePath));
      if (!fs.existsSync(processedImportPath)) {
        throw new Error(`SCSS loader: File path "${filePath}" was not found.`);
      }

      filePath = processedImportPath;
    }

    if (filePath[filePath.length - 1] === path.sep && fs.statSync(filePath).isDirectory()) {
      let collectedCode = '';

      readSCSSFilesFromDirectory(filePath).forEach(scssPath => {
        collectedCode += fs.readFileSync(scssPath, 'utf-8');
      });

      return collectedCode;
    } else if (fs.statSync(filePath).isDirectory()) {
      throw new Error(`Non-directory path (not ending with "${path.sep}") "${filePath}" is and should not be a directory`)
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

export default function(element) {
  return {
      writeCssFile: writeCssFile.bind(element),
      readSCSSFilesFromDirectory: readSCSSFilesFromDirectory.bind(element),
      getCodeFromFile: getCodeFromFile.bind(element)
  };
};