import TheService from './_service';
import IRWSConfig from '../interfaces/IRWSConfig';


const _DEFAULTS: {[property: string]: any} = {
    'pubPrefix': '/',
    'pubUrl' : window.origin,
};

const __SENT_TO_COMPONENTS: string[] = [];

class ConfigService extends TheService {  
    static isLoaded: boolean = false;

    private data: IRWSConfig = {};    
  
    constructor() {
        super();                     
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
            };
    
            t = setTimeout(tick, 200);
        });       
    }

    isLoaded(): boolean
    {
        return ConfigService.isLoaded;
    }

    mergeConfig(config: IRWSConfig) {
        const unloaded = ConfigService.isLoaded;        

        this.data = Object.assign(this.data, config);

        if(unloaded){
            ConfigService.isLoaded = true;
        }
    }

    getData(): IRWSConfig
    {
        return this.data;
    }
}

export default ConfigService.getSingleton();

export { ConfigService as ConfigServiceInstance };