const sass = require('sass');
const path = require('path');
const chalk = require('chalk');
const emojiRegex = require('emoji-regex');

const _scss_fonts_builder = require('./_fonts');
let _scss_fonts = null;

const _scss_import_builder = require('./_import');
let _scss_import = null;

function compileScssCode(scssCode, fileRootDir, createFile = false, filePath = null, minify = false) {  
    _scss_fonts = _scss_fonts_builder(this);
    _scss_import = _scss_import_builder(this);

    const [scssImports] = _scss_import.extractScssImports(scssCode, fileRootDir);

    const dependencies = scssImports.map((item) => item[2]);

    if (scssImports && scssImports.length) {
      scssCode = _scss_import.replaceImports(_scss_import.processImports(scssImports, fileRootDir), scssCode);
    }

    const uses = _scss_import.extractScssUses(scssCode)[0];
    let scssUses = '';


    uses.forEach(scssUse => {
      const useLine = scssUse[1];
      if(scssCode.indexOf(useLine) === -1){                
        scssUses += useLine + '\n';
        scssCode = scssCode.replace(useLine + '\n', '');
      }
    });

    scssCode = removeComments(scssUses + scssCode);

    try {
      const result = sass.compileString(scssCode, { loadPaths: [fileRootDir]});

      let compiledCode = result.css.toString();
      compiledCode = _scss_fonts.replaceFontUrlWithBase64(compiledCode);
      compiledCode = replaceEmojisWithQuestionMark(compiledCode, fileRootDir);
      return { code: compiledCode, dependencies};
    } catch (err) {
      console.error('SASS Error in', fileRootDir);

      console.error(err);
      throw err;
      return '';
    };
  }

  function checkForImporterType(_module, checkTypeExt) {
    let importingFileExtension = '';

    if (_module && _module.issuer && _module.issuer.resource) {
      importingFileExtension = path.extname(_module.issuer.resource);
      if (importingFileExtension === ('.' + checkTypeExt)) {
        return true;
      }
    } else {
      return false;
    }

    return false
  }

  function replaceEmojisWithQuestionMark(code, componentDir) {
    const regex = emojiRegex();
    let hasEmoji = false;
    
    const result = code.replace(regex, (match) => {
      hasEmoji = true;
      return '?';
    });
  
    if (hasEmoji) {
      console.log(chalk.yellow(`Emojis in css detected and replaced with "?" in "${path.dirname(componentDir)}" component`));
    }
  
    return result;
  }

  function removeComments(code) {
    code = code.replace(/\/\/.*$/gm, '');
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/^\s*$(?:\r\n?|\n)/gm, '');
    
    return code;
  }
  
  module.exports = function(element) {
    return {
        checkForImporterType: checkForImporterType.bind(element),
        compileScssCode: compileScssCode.bind(element)
    };
  };