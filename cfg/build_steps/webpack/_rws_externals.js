const fs = require('fs');
const path = require('path');
const tools = require('../../../_tools');

const frontendRequestContextCache = [];

const _defaultOpts = { 
  _vars: {
    packed: [],
    ignored: [],
    frontendRequestContextCache
  }
}

const externals = (declaredCodeBase, nodeModules, automatedChunks, externalOptions = _defaultOpts) => ({context, request}, callback) => {
    let theOptions = _defaultOpts;

    if(externalOptions !== null){      
      theOptions = Object.assign(theOptions, externalOptions);
    }

    const codeBase = path.resolve(declaredCodeBase);        

    const ignored = [
      // /css-loader/,
      /tslib/,
      /reflect-metadata/, 
      /\@microsoft\/fast-foundation\/.*/     
    ]

    const enforced = [
      /entities/,      
      /\@microsoft\/fast-foundation\/.*\/di/,
      /\@microsoft\/fast-foundation\/.*\/foundation-element/
    ]

    const frontendDirs = [
      codeBase,
      path.resolve(__dirname,'..','..','..')
    ];        

    const inFrontendContext = frontendDirs.some(dir => context.startsWith(dir)) || 
        externalOptions._vars.frontendRequestContextCache.some(package => context.indexOf(package.request) > -1)
    
        ;

    const patternInContextOrRequest = pattern => pattern.test(request) || pattern.test(context);

    const isIgnored = ignored.some(patternInContextOrRequest);
    const isEnforced = enforced.some(patternInContextOrRequest);

    if (isEnforced || (!isIgnored && inFrontendContext)) {      
      if(!externalOptions._vars.packed.find(package => package.request  === request && package.context  === context)){
        externalOptions._vars.packed.push({request, context});      
      }

      externalOptions._vars.frontendRequestContextCache.push({request, context});
      
      //handled as RWS async dependency
      return callback();
    }
    
    externalOptions._vars.ignored.push({request, context});

    //using require from vendors
    callback(null, false);
  }

module.exports = {rwsExternals: externals, _externalsDefaults: _defaultOpts};