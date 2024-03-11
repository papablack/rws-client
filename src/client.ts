import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify from './types/RWSNotify';
import NotifyService, {NotifyServiceInstance} from './services/NotifyService';
import { 
    IFrontRoutes,  _ROUTING_EVENT_NAME
} from './services/RoutingService';
import ApiService, { ApiServiceInstance, IBackendRoute } from './services/ApiService';
import registerRWSComponents from './components';

import IRWSUser from './interfaces/IRWSUser';
import { DI, Container } from "@microsoft/fast-foundation";

import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import WSService, { WSServiceInstance } from './services/WSService'
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';

interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    }
}

type RWSEventListener = (event: CustomEvent) => void;

export default class RWSClient {  
    private DI: Container;
    private user: IRWSUser = null;

    private config: IRWSConfig = { backendUrl: '', routes: {}, splitFileDir: '/', splitPrefix: 'rws' };
    protected initCallback: () => Promise<void> = async () => {};
    
    sw: ServiceWorkerServiceInstance;
    ws: WSServiceInstance;
    api: ApiServiceInstance;
    appConfig: ConfigServiceInstance;
    notify: NotifyServiceInstance;

    private isSetup = false;

    private cfgSetupListener: RWSEventListener = (event: CustomEvent<{ callId: string }>) => {
        console.log('Received custom event from web component:', event.detail);
        // this.broadcastConfigForViewComponents();
    };

    constructor(
    ){
        this.DI = DI.getOrCreateDOMContainer();

        this.appConfig = this.DI.get<ConfigServiceInstance>(ConfigServiceInstance);
        this.sw = this.DI.get<ServiceWorkerServiceInstance>(ServiceWorkerServiceInstance); 
        this.ws = this.DI.get<WSServiceInstance>(WSServiceInstance);
        this.api = this.DI.get<ApiServiceInstance>(ApiServiceInstance);
        this.notify = this.DI.get<NotifyServiceInstance>(NotifyServiceInstance);

        this.user = this.getUser();

        this.pushDataToServiceWorker('SET_WS_URL', { url: this.appConfig.get('wsUrl')}, 'ws_url');

        if(this.user){            
            this.pushUserToServiceWorker({...this.user, instructor: false});        
        }
    }

    async setup(config: IRWSConfig = {}): Promise<IRWSConfig> 
    {                
        this.config = {...this.config, ...config};                                 
        this.appConfig.mergeConfig(this.config);
        console.log(this.appConfig.getData());

        // this.on<IRWSConfig>('rws_cfg_call', this.cfgSetupListener);

        const hotModule: IHotModule = (module as IHotModule);

        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function() {
                console.log('Accepting the updated module!');              
            });
        }                 

        if(this.appConfig.get('parted')){
            const componentParts: string[] = await this.api.get<string[]>(this.appConfig.get('splitFileDir')+'/rws_chunks_info.json');
    
            componentParts.forEach((componentName: string) => {
                const script: HTMLScriptElement = document.createElement('script');       
    
                script.src = this.appConfig.get('splitFileDir') + `/${this.appConfig.get('splitPrefix')}.${componentName}.js`;  // Replace with the path to your script file
                script.async = true;        
                script.type = 'text/javascript';
    
                console.log(`Appended ${componentName} component`);
                document.body.appendChild(script);
            });
        }
    
    
        this.isSetup = true;
        return this.config;
    }

    async start(config: IRWSConfig = {}): Promise<RWSClient> 
    {  
        this.config = {...this.config, ...config};
        
        if(!this.isSetup){
            this.config = await this.setup(this.config);
        }

        if(Object.keys(config).length){            
            this.appConfig.mergeConfig(this.config);
        }

        console.log(this.isSetup, this.config, this.appConfig);
        
        if(this.config.user && !this.config.dontPushToSW){            
            this.pushUserToServiceWorker(this.user);
        }

        await startClient();

        if(!this.config?.ignoreRWSComponents){
            registerRWSComponents();
        }        
        
        await this.initCallback();
    
        return this;
    }

    private broadcastConfigForViewComponents(): void
    {
        document.dispatchEvent(new CustomEvent<{ config: IRWSConfig }>('rws_cfg_broadcast', { detail: {config: this.appConfig.getData()}}));
    }

    public addRoutes(routes: IFrontRoutes){
        this.config.routes = routes;
    }

    public setNotifier(notifier: RWSNotify): RWSClient
    {
        this.notify.setNotifier(notifier);

        return this;
    }

    public setDefaultLayout(DefaultLayout: any): RWSClient 
    {
        this.config.defaultLayout = DefaultLayout;

        return this;
    }

    public setBackendRoutes(routes: IBackendRoute[]): RWSClient
    {
        this.config.backendRoutes = routes;            
        return this;
    }

    public async onInit(callback: () => Promise<void>): Promise<RWSClient>
    {
        this.initCallback = callback;
        return this;
    }

    public pushDataToServiceWorker(type: string, data: any, asset_type: string = 'data_push'): void
    {
        let tries = 0;
        
        const doIt: () => void = () => {
            try {
                this.sw.sendDataToServiceWorker(type, data, asset_type);
            } catch(e){
                if(tries < 3){
                    setTimeout(() => { doIt(); }, 300)               
                    tries++;
                }                
            }
        }

        doIt();
    }

    public pushUserToServiceWorker(userData: any)
    {
        this.setUser(userData);
        this.pushDataToServiceWorker('SET_USER', userData, 'logged_user');
    }

    getUser(): IRWSUser
    {

        const localSaved = localStorage.getItem('the_rws_user');

        if(!!localSaved){
            this.setUser(JSON.parse(localSaved) as IRWSUser);
        }

        return this.user;
    }

    setUser(user: IRWSUser): RWSClient
    {
        if(!user || !user?.jwt_token){
            console.warn('[RWS Client Warning]', 'Passed user is not valid', user);
            return this;
        }

        this.user = user;

        this.api.setToken(this.user.jwt_token);
        this.ws.setUser(this.user);
        
        localStorage.setItem('the_rws_user', JSON.stringify(this.user));


        return this;
    }

    getConfig(): ConfigServiceInstance
    {
        return this.appConfig;
    }

    on<T>(eventName: string, listener: RWSEventListener): void {
        document.addEventListener(eventName, (event: Event) => {
            listener(event as CustomEvent<T>);           
        });
    }

    private enableRouting(): void
    {
        
    }

    protected devStorage: {[key: string]: any} = {};

    setDevStorage(key: string, stuff: any): RWSClient
    {
        this.devStorage[key] = stuff;
        return this;
    }

    getDevStorage(key: string): any
    {         
        return this.devStorage[key];
    }

    registerToDI(): void
    {

    }
}

export { IHotModule }