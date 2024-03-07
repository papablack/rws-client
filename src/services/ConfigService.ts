import TheService from './_service';
import IRWSConfig from '../interfaces/IRWSConfig';

const _DEFAULTS: {[property: string]: any} = {
    'pubPrefix': '/',
    'pubUrl' : window.origin,
}

class ConfigService extends TheService {
    static isLoaded: boolean = false;

    private data: IRWSConfig;    
  
    constructor(cfg: IRWSConfig) {
        super();    
        this.data = cfg;              
    }    
  
    public get(key: keyof IRWSConfig): any
    {     
        
        const isInData: boolean = Object.keys(this.data).includes(key);
        const isInDefaults: boolean = Object.keys(_DEFAULTS).includes(key);

        if(!isInData && isInDefaults){
            let defaultVal = _DEFAULTS[key];        

            if(defaultVal[0] === '@'){
                defaultVal = this.data[((defaultVal as string).slice(1)) as keyof IRWSConfig];
            }

            return defaultVal;
        } else if(!isInData && !isInDefaults) {
            return null;
        }
        

        return this.data[key as keyof IRWSConfig];
    }
  
    public async reloadConfig(cfgString: string): Promise<ConfigService> 
    {
        const module = await import(/* webpackIgnore: true */ cfgString);
        const cfg: () => IRWSConfig = module.defaults;      
        this.data = cfg();
  
        return this;
    }
  
    public static getConfigSingleton<T extends new (...args: any[]) => TheService>(this: T, cfg?: IRWSConfig): ConfigService
    {
        const className = this.name;
        const instanceExists = TheService._instances[className];

        if(!ConfigService.isLoaded){
            TheService._instances[className] = new this({}); 
            ConfigService.isLoaded = true;
        }else{        
            if (cfg) {                
                TheService._instances[className] = new this(cfg);        
            }else if(!instanceExists && !cfg){
                // return new this({}) as ConfigService; // DO NOT USE OR I'LL CUT U!!!!!!

                throw new Error('[RWS] No frontend configuration passed to RWSClient');
            }

        }
  
        return TheService._instances[className] as ConfigService;
    }  

    getData(): IRWSConfig
    {
        return this.data;
    }
}

export default (cfg?: IRWSConfig): ConfigService => ConfigService.getConfigSingleton(cfg);
export { ConfigService as ConfigServiceInstance };