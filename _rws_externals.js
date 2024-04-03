const fs = require('fs');
const path = require('path');

const tools = require('./_tools');

const _defaultOpts = { 
  inc_list_context: [],
  inc_list: [],
  not_inc_list: [],
  not_inc_list_context: ['@rws-framework/client', 'node_modules'],
  exceptions: [],
  exceptions_context: [],  
}

const moduleDir = path.resolve(path.dirname(module.id));    
const nodeModules = path.resolve(tools.findRootWorkspacePath(process.cwd()), '/node_modules');


const externals = (declaredCodeBase, nodeModules, externalOptions = _defaultOpts) => ({context, request}, callback) => {
    let theOptions = _defaultOpts;

    if(externalOptions !== null){      
      theOptions = Object.assign(theOptions, externalOptions);
    }

    const codeBase = path.resolve(declaredCodeBase);  
    
    let mergeTarget = true;

    if (mergeTarget) {
      //merging to output
      return callback();
    }
    
    //using require from node_modules
    callback(null, 'commonjs ' + request);
  }

module.exports = {rwsExternals: externals, _externalsDefaults: _defaultOpts};