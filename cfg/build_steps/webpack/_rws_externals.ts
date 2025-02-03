import {  } from 'webpack';
import * as fs from 'fs';
import * as path from 'path';

interface PackageContext {
  request: string;
  context: string;
}

interface ExternalOptions {
  _vars: {
    packed: PackageContext[];
    ignored: PackageContext[];
    frontendRequestContextCache: PackageContext[];
  }
}

const frontendRequestContextCache: PackageContext[] = [];

const _defaultOpts: ExternalOptions = { 
  _vars: {
    packed: [],
    ignored: [],
    frontendRequestContextCache
  }
}

export const rwsExternals = (
  declaredCodeBase: string, 
  nodeModules: string[], 
  automatedChunks: Record<string, string>,
  externalOptions: ExternalOptions = _defaultOpts
): any => {
  return ({ context, request }: { context: string; request: string }, 
          callback: (error?: null | Error, result?: boolean | string | string[]) => void
  ): void => {
    let theOptions = _defaultOpts;

    if (externalOptions !== null) {      
      theOptions = Object.assign(theOptions, externalOptions);
    }

    const codeBase = path.resolve(declaredCodeBase);        

    const ignored = [
      /tslib/,
      /reflect-metadata/, 
      /\@microsoft\/fast-foundation\/.*/     
    ];

    const enforced = [
      /entities/,      
      /\@microsoft\/fast-foundation\/.*\/di/,
      /\@microsoft\/fast-foundation\/.*\/foundation-element/
    ];

    const frontendDirs = [
      codeBase,
      path.resolve(__dirname,'..','..','..')
    ];        

    const inFrontendContext = frontendDirs.some(dir => context.startsWith(dir)) || 
      theOptions._vars.frontendRequestContextCache.some(pkg => context.indexOf(pkg.request) > -1);

    const patternInContextOrRequest = (pattern: RegExp): boolean => 
      pattern.test(request) || pattern.test(context);

    const isIgnored = ignored.some(patternInContextOrRequest);
    const isEnforced = enforced.some(patternInContextOrRequest);

    if (isEnforced || (!isIgnored && inFrontendContext)) {      
      if(!theOptions._vars.packed.find(pkg => pkg.request === request && pkg.context === context)){
        theOptions._vars.packed.push({request, context});      
      }

      theOptions._vars.frontendRequestContextCache.push({request, context});
      
      //handled as RWS async dependency
      return callback();
    }
    
    theOptions._vars.ignored.push({request, context});

    //using require from vendors
    callback(null, false);
  };
};

export const _externalsDefaults = _defaultOpts;