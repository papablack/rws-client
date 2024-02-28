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

    constructor(){
        this.user = this.getUser();

        this.pushDataToServiceWorker('SET_WS_URL', { url: (window as any).edrnaConfig.websocket_host + ':' + (window as any).edrnaConfig.websocket_port }, 'ws_url');

        if(this.user){            
            this.pushUserToServiceWorker({...this.user, instructor: false});        
        }
    }

    async start(config: IRWSConfig = {}): Promise<boolean> {    
        this.config = {...this.config, ...config};                                 

        const hotModule: IHotModule = (module as IHotModule);

        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function() {
                console.log('Accepting the updated module!');              
            });
        }        
        
        await startClient(this.config);
        
        if(!this.config?.ignoreRWSComponents){
            registerRWSComponents();
        }
        
        await this.initCallback();
    
        return true;
    }

    public addRoutes(routes: IFrontRoutes){
        this.config.routes = routes;
    }

    public setNotifier(notifier: RWSNotify)
    {
        NotifyService.setNotifier(notifier);
    }

    public setDefaultLayout(DefaultLayout: any) {
        this.config.defaultLayout = DefaultLayout;
    }

    public setBackendRoutes(routes: IBackendRoute[]) {
        this.config.backendRoutes = routes;            
    }

    public async onInit(callback: () => Promise<void>): Promise<void>
    {
        this.initCallback = callback;
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