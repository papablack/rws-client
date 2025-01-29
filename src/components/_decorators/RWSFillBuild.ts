import IRWSConfig from '../../types/IRWSConfig.js';

function extractEnvVar(envVar: string){
    const extractedVars = JSON.parse(JSON.stringify(envVar));                                  

    const {   
        backendUrl,
        wsUrl,
        partedDirUrlPrefix,
        partedPrefix,
        pubUrlFilePrefix,
        transports,    
        parted        
    } = extractedVars;

    const extractedFrontendVars = {
        backendUrl,
        wsUrl,
        partedDirUrlPrefix,
        partedPrefix,
        pubUrlFilePrefix,
        transports,    
        parted
    };

    return {
        extractedVars,
        extractedFrontendVars
    };
}

function RWSFillBuild(config: Partial<IRWSConfig> = {}) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            _DEFAULTS: IRWSConfig;
            _BUILD_OVERRIDE: IRWSConfig;
            constructor(...args: any[]) {
                super(...args);

                const extractedFrontendDefaults = extractEnvVar(process.env._RWS_DEFAULTS).extractedFrontendVars;

                this._DEFAULTS = {
                    ...config,
                    ...extractedFrontendDefaults
                } as IRWSConfig;        
                
                const extractedFrontendBuildVars = extractEnvVar(process.env._RWS_BUILD_OVERRIDE).extractedFrontendVars;

                this._BUILD_OVERRIDE = extractedFrontendBuildVars as IRWSConfig;
            }
        };
    };
}

export { RWSFillBuild };