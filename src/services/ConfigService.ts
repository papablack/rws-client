import TheService from "./_service";
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
  
    public reloadConfig(cfgString: string): ConfigService 
    {
      const cfg: () => IRWSConfig = (require(cfgString)).defaults; 
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
          TheService._instances[className] = new this({});           
      }
  
      return TheService._instances[className] as ConfigService;
    }  
}

export default (cfg?: IRWSConfig): ConfigService => ConfigService.getConfigSingleton(cfg);
export { ConfigService }