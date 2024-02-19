import TheService from './_service';
import IRWSConfig from '../interfaces/IRWSConfig';


class ConfigService extends TheService {
    private data: IRWSConfig;    
  
    constructor(cfg: IRWSConfig) {
        super();    
        this.data = cfg;              
    }    
  
    public get(key: keyof IRWSConfig): any
    {     
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
      
        if (cfg) {                
            TheService._instances[className] = new this(cfg);        
        }else if(!instanceExists && !cfg){
            throw new Error('no-cfg');
        }
  
        return TheService._instances[className] as ConfigService;
    }  
}

export default (cfg?: IRWSConfig): ConfigService => ConfigService.getConfigSingleton(cfg);
export { ConfigService };