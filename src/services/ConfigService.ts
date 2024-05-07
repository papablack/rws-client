import TheService from './_service';
import IRWSConfig from '../interfaces/IRWSConfig';
import { RWSFillBuild } from '../components/_decorators/RWSFillBuild';




const __SENT_TO_COMPONENTS: string[] = [];

@RWSFillBuild()
class ConfigService extends TheService {  
    static _DEFAULT: boolean = false;
    static isLoaded: boolean = false;
    
    _DEFAULTS: Partial<IRWSConfig> = {};
    _BUILD_OVERRIDE: IRWSConfig = {};

    private data: IRWSConfig = {};    
  
    constructor() {
        super();       
    }    
  
    public get(key: keyof IRWSConfig): any
    {       
                
        if(!this._DEFAULTS){
            throw new Error('No _DEFAULTS loaded!');
        }        

        
        const isInDefaults: boolean = Object.keys(this._DEFAULTS).includes(key);
        const isInData: boolean = Object.keys(this.data).includes(key);
        const isInBuildVars: boolean = Object.keys(this._BUILD_OVERRIDE).includes(key);

        let isDev = false;

        if((Object.keys(this._BUILD_OVERRIDE).includes('dev'))){
            isDev = Object.keys(this._BUILD_OVERRIDE).includes('dev') && this._BUILD_OVERRIDE.dev;
        }

        if(!isInData){        
            let defaultVal = null;

            if(isInDefaults){
                defaultVal = this._DEFAULTS[key];                   
            }                             
                        
            if(defaultVal && defaultVal[0] === '@'){
                defaultVal = this.data[((defaultVal as string).slice(1)) as keyof IRWSConfig];
            }

            if(isInBuildVars && Object.keys(this._BUILD_OVERRIDE).includes(key)){
                if(isDev){
                    console.warn(`.rws.json override [${key}]:`), this._BUILD_OVERRIDE[key];
                }

                defaultVal = this._BUILD_OVERRIDE[key];
            }

            return defaultVal;
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