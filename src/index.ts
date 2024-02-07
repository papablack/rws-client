import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyService from './services/NotifyService';
import RoutingService, { IFrontRoutes, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent } from './services/RoutingService';
import DOMService, { DOMOutputType }  from './services/DOMService';
import RWSViewComponent from './components/_component';
import RWSView from './components/_decorator';
import ApiService, { IBackendRoute } from './services/ApiService';
import RWSService from './services/_service';
import WSService from './services/WSService';
import { RouterComponent } from './components/router/component';
import registerRWSComponents from './components/index';

interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    }
}

class RWSClient {   
    private config: IRWSConfig = { backendUrl: '', routes: {} };
    protected initCallback: () => Promise<void> = async () => {};

    async start(config: IRWSConfig = {}): Promise<boolean> {    
        this.config = {...this.config, ...config};                                 

        const hotModule:IHotModule = (module as IHotModule);

        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function() {
              console.log('Accepting the updated module!');              
            })
        }

        const packageInfo = "";
        
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

    private enableRouting(): void
    {
        
    }
}

export default RWSClient;
export { 
    NotifyUiType,
    NotifyLogType,

    RouteReturn,
    _ROUTING_EVENT_NAME, NotifyService,
    IRoutingEvent,

    ApiService,    
    WSService,
    RoutingService,
    DOMService,
    DOMOutputType,

    RWSViewComponent,        
    RWSView,
    RWSService,
    RouterComponent,

    renderRouteComponent,
    registerRWSComponents,

    observable,
    attr 
}