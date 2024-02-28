import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify from './types/RWSNotify';
import {NotifyService} from './services/NotifyService';
import { 
    IFrontRoutes,  _ROUTING_EVENT_NAME
} from './services/RoutingService';
import { ApiService, IBackendRoute } from './services/ApiService';
import registerRWSComponents from './components';
import ServiceWorkerService from './services/ServiceWorkerService';
import IRWSUser from './interfaces/IRWSUser';
import {RWSWSService} from './services/WSService'
import appConfig from './services/ConfigService';

interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    }
}

export default class RWSClient {   
    private user: IRWSUser = null;
    private config: IRWSConfig = { backendUrl: '', routes: {} };
    protected initCallback: () => Promise<void> = async () => {};

    private isSetup = false;

    constructor(){
        this.user = this.getUser();

        this.pushDataToServiceWorker('SET_WS_URL', { url: (window as any).edrnaConfig.websocket_host + ':' + (window as any).edrnaConfig.websocket_port }, 'ws_url');

        if(this.user){            
            this.pushUserToServiceWorker({...this.user, instructor: false});        
        }
    }

    async setup(config: IRWSConfig = {}): Promise<IRWSConfig> 
    {    
        this.config = {...this.config, ...config};                                 
        appConfig(this.config);

        const hotModule: IHotModule = (module as IHotModule);

        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function() {
                console.log('Accepting the updated module!');              
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

    public addRoutes(routes: IFrontRoutes){
        this.config.routes = routes;
    }

    public setNotifier(notifier: RWSNotify): RWSClient
    {
        NotifyService.setNotifier(notifier);

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
                ServiceWorkerService.sendDataToServiceWorker(type, data, asset_type);
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

        ApiService.setToken(this.user.jwt_token);
        RWSWSService.setUser(this.user);
        
        localStorage.setItem('the_rws_user', JSON.stringify(this.user));


        return this;
    }

    private enableRouting(): void
    {
        
    }
}

export { IHotModule }