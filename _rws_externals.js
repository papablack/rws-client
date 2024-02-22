const fs = require('fs');
const path = require('path');

const tools = require('./_tools');

const _defaultOpts = { 
  inc_list_context: [],
  inc_list: [],
  not_inc_list: [],
  not_inc_list_context: ['rws-js-client', 'node_modules'],
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
    
    let mergeTarget = false;

    if(
      context.indexOf('rws-js-client') > -1 || request.indexOf('rws-js-client') > -1
      ){      
      mergeTarget = false;
    }

    if(
      context.indexOf(codeBase) === 0 ||
      request.indexOf('src/services') > -1 
      || request.indexOf('./_service') > -1 
      || context.indexOf('./ws_handlers') > -1
      || request.indexOf('./ws_handlers') > -1
      || request.indexOf('services/WSService') > -1
      || context.indexOf('node_modules') > -1
    )
    {
      mergeTarget = true;
    }

    if(
      request.indexOf('./services/NotifyService') > -1 || 
      request.indexOf('./services/RoutingService') > -1 ||
      request.indexOf('./services/DOMService') > -1      
      ){      
      mergeTarget = false;
    }

    if(mergeTarget){
      console.log('rEQ', context, request)
    }else{
      // console.log('NrEQ', context.indexOf(codeBase) === 0, context, request)

    }

    if (mergeTarget) {
      //merging to output
      return callback();
    }
    
    //using require from node_modules
    callback(null, 'commonjs ' + request);
  }

module.exports = {rwsExternals: externals, _externalsDefaults: _defaultOpts};