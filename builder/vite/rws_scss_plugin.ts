import path from 'path';
import { rwsPath } from '@rws-framework/console';

import _scss_compiler_builder from './scss/_compiler';
import _scss_import_builder from './scss/_import';

import _scss_fs_builder from './scss/_fs';

type PluginParams = { autoCompile: string[], dev: boolean };

class RWSScssPlugin {
  protected autoCompile: string[] = [];
  protected node_modules_dir: (fileDir: string) => void;

  private _scss_import: any;    
  private _scss_fs: any;
  private _scss_compiler: any;
  private dev

  constructor(params: PluginParams = { autoCompile: [], dev: true }) {
    this.node_modules_dir = (fileDir) => path.relative(fileDir, rwsPath.findRootWorkspacePath(process.cwd())) + '/node_modules/'
    this._scss_import = _scss_import_builder(this);    
    this._scss_fs = _scss_fs_builder(this);
    this._scss_compiler = _scss_compiler_builder(this);

    if (!!params.autoCompile && params.autoCompile.length > 0) {
      this.autoCompile = params.autoCompile;
    }

    for (let index in this.autoCompile) {
      const sassFile = this.autoCompile[index];
      this.compileFile(sassFile);
    }
  }

  
  apply(compiler) {
    const _self = this;

    return;
  }

  async compileFile(scssPath): Promise<{ code: string, dependencies: string[]}>
  {    
      scssPath = this._scss_import.processImportPath(scssPath, path.dirname(scssPath))    
      let scssCode = this._scss_fs.getCodeFromFile(scssPath);
      return await this._scss_compiler.compileScssCode(scssCode, path.dirname(scssPath), null, scssPath);
  }

  async compileScssCode(scssCode: string, scssPath: string): Promise<{ code: string, dependencies: string[]}>
  {             
      return await this._scss_compiler.compileScssCode(scssCode, scssPath, this.dev);
  }
  
  writeCssFile(scssFilePath: string, cssContent: string): string
  {
    return this._scss_fs.writeCssFile(scssFilePath, cssContent);
  }
}

export {RWSScssPlugin};
