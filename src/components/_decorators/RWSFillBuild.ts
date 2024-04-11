import 'reflect-metadata';
import IRWSConfig from '../../interfaces/IRWSConfig.js';


function RWSFillBuild(config?: Partial<IRWSConfig>) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            _DEFAULTS: IRWSConfig;
            constructor(...args: any[]) {
                super(...args);

                const extractedDefaults = JSON.parse(JSON.stringify(process.env._RWS_DEFAULTS));                                  

                const {   
                    backendUrl,
                    wsUrl,
                    partedDirUrlPrefix,
                    partedPrefix,
                    pubUrlFilePrefix,
                    transports,    
                    parted        
                } = extractedDefaults;

                const extractedFrontendDefaults = {
                    backendUrl,
                    wsUrl,
                    partedDirUrlPrefix,
                    partedPrefix,
                    pubUrlFilePrefix,
                    transports,    
                    parted
                };

                this._DEFAULTS = {
                    ...config,
                    ...extractedFrontendDefaults
                };             
            }
        };
    };
}

export { RWSFillBuild }