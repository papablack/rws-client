import TheService from './_service';
import IRWSConfig from '../interfaces/IRWSConfig';
import { v4 as uuid } from 'uuid';

const _DEFAULTS: {[property: string]: any} = {
    'pubPrefix': '/',
    'pubUrl' : window.origin,
}

const __SENT_TO_COMPONENTS: string[] = [];

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
            TheService._instances[className] = new this({_noLoad: true});
            ConfigService.isLoaded = true;   
        }else{               
            if (cfg) {        
                
                const doneComponents: {[key: string]: boolean} = {};
      
                TheService._instances[className] = new this(cfg);     
                document.addEventListener('rws_cfg_call', (event: Event) => {
                    const newEvent: CustomEvent<{tagName: string}> = event as CustomEvent<{tagName: string}>;   
                    console.log('sent cfg', cfg);            
                    if(!!doneComponents[newEvent.detail.tagName]){
                        return;
                    }
                    doneComponents[newEvent.detail.tagName] = true;       
                    document.dispatchEvent(new CustomEvent<{config: IRWSConfig}>('rws_cfg_set_' + newEvent.detail.tagName, { detail: { config: cfg} }))
                }, { once: true });                                 
            }else if(!instanceExists && !cfg){
                // return new this({}) as ConfigService; // DO NOT USE OR I'LL CUT U!!!!!!

                throw new Error('No frontend cfg');
            }

        }
  
        return TheService._instances[className] as ConfigService;
    }  

    async waitForConfig(tagName: string): Promise<boolean>
    {        
        let t: NodeJS.Timeout | null = null;

        if(!this.data._noLoad || __SENT_TO_COMPONENTS.includes(tagName)){
            return;
        }

        __SENT_TO_COMPONENTS.push(tagName);

        document.dispatchEvent(new CustomEvent<{tagName: string}>('rws_cfg_call', {
            detail: {tagName},
        }));

        return new Promise((resolve) => {
            const tick = () => {
                if(ConfigService.isLoaded){
                   

                    // console.log('resolved', tagName);
                    clearTimeout(t);    
                    resolve(true);
                    return;
                }
    
                t = setTimeout(tick, 200);
            }
    
            t = setTimeout(tick, 200);
        });       
    }

    isLoaded(): boolean
    {
        return ConfigService.isLoaded;
    }

    mergeConfig(config: IRWSConfig) {
        console.log('merging', config);
        this.data = Object.assign(this.data, config);
    }

    getData(): IRWSConfig
    {
        return this.data;
    }
}

export default (cfg?: IRWSConfig): ConfigService => ConfigService.getConfigSingleton(cfg);
export { ConfigService as ConfigServiceInstance };