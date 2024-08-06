const path = require('path');
const _tools = require('../_tools');

const _scss_compiler_builder = require('./scss/_compiler');
let _scss_compiler = null;
const _scss_import_builder = require('./scss/_import');
let _scss_import = null;
const _scss_fs_builder = require('./scss/_fs');
let _scss_fs = null;


class RWSScssPlugin {
  autoCompile = [];

  constructor(params) {
    this.node_modules_dir = (fileDir) => path.relative(fileDir, _tools.findRootWorkspacePath(process.cwd())) + '/node_modules/'
    _scss_import = _scss_import_builder(this);    
    _scss_fs = _scss_fs_builder(this);
    _scss_compiler = _scss_compiler_builder(this);

    if (!params) {
      params = {};
    }

    if (!!params.autoCompile && params.autoCompile.length > 0) {
      this.autoCompile = params.autoCompile;
    }

    for (let index in this.autoCompile) {
      const sassFile = this.autoCompile[index];
      this.compileFile(sassFile, true);
    }
  }

  
  apply(compiler) {
    const _self = this;

    return;
  }

  async compileFile(scssPath) {    
    scssPath = _scss_import.processImportPath(scssPath, path.dirname(scssPath))

    let scssCode = _scss_fs.getCodeFromFile(scssPath);

    return await _scss_compiler.compileScssCode(scssCode, path.dirname(scssPath));
  }

  async compileScssCode(scssCode, scssPath){    
    return await _scss_compiler.compileScssCode(scssCode, scssPath);
  }

  writeCssFile(scssFilePath, cssContent){
    return _scss_fs.writeCssFile(scssFilePath, cssContent);
  }
}

module.exports = RWSScssPlugin;
