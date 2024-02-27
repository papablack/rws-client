import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify from './types/RWSNotify';
import {NotifyService} from './services/NotifyService';
import { 
    IFrontRoutes,  _ROUTING_EVENT_NAME
} from './services/RoutingService';
import { IBackendRoute } from './services/ApiService';
import registerRWSComponents from './components';
import ServiceWorkerService from './services/ServiceWorkerService';

interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    }
}

export default class RWSClient {   
    private config: IRWSConfig = { backendUrl: '', routes: {}, pubUrl: '/' };
    protected initCallback: () => Promise<void> = async () => {};

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

    public sendDataToServiceWorker(type: string, data: any): void
    {
        ServiceWorkerService.sendDataToServiceWorker(type, data);
    }

    public pushJWTToServiceWorker(jwtToken: string)
    {
        this.sendDataToServiceWorker();
    }

    private enableRouting(): void
    {
        
    }
}

export { IHotModule }