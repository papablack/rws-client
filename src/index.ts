import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyServiceInstance, {NotifyService} from './services/NotifyService';
import RoutingServiceInstance, { 
    IFrontRoutes, renderRouteComponent, RouteReturn, 
    _ROUTING_EVENT_NAME, IRoutingEvent, RWSRoutingService as RoutingService,
    RWSRouter, IRWSRouteResult
} from './services/RoutingService';
import DOMServiceInstance, { DOMService, DOMOutputType }  from './services/DOMService';
import RWSViewComponent, { IAssetShowOptions } from './components/_component';
import RWSView, {RWSDecoratorOptions} from './components/_decorator';
import ApiServiceInstance,  { IBackendRoute, ApiService, IHTTProute, IPrefixedHTTProutes } from './services/ApiService';
import RWSService from './services/_service';
import UtilsServiceInstance, {RWSUtilsService as UtilsService} from './services/UtilsService';
import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import WSServiceInstance, {RWSWSService as WSService, WSStatus} from './services/WSService';
import { RouterComponent } from './components/router/component';
import registerRWSComponents, { RWSUploader } from './components';
import { ngAttr } from './components/_attrs/angular-attr';


interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    }
}

class RWSClient {   
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

    private enableRouting(): void
    {
        
    }
}

export default RWSClient;
export { 
    NotifyUiType,
    NotifyLogType,

    RouteReturn,
    _ROUTING_EVENT_NAME,
    IRoutingEvent,
    RoutingServiceInstance,
    RoutingService,
    ApiServiceInstance,
    ApiService,    
    WSServiceInstance,
    WSService,
    UtilsServiceInstance,    
    UtilsService,    
    DOMServiceInstance,
    DOMService,
    DOMOutputType,
    NotifyServiceInstance,
    NotifyService,
    ConfigServiceInstance,
    ConfigService as getRWSConfig,

    RWSNotify,
    RWSRouter,
    IFrontRoutes as IRWSFrontRoutes,
    IBackendRoute as IRWSBackendRoute,
    RWSDecoratorOptions as IRWSDecoratorOptions,
    IRWSRouteResult,
    IHTTProute as IRWSHttpRoute,
    IPrefixedHTTProutes as IRWSPrefixedHTTProutes,
    WSStatus as IRWSWebsocketStatus,
    IAssetShowOptions as IRWSAssetShowOptions,
    IRWSConfig,

    RWSViewComponent,        
    RWSView,
    ngAttr,
    RWSService,

    RouterComponent,
    RWSUploader,

    renderRouteComponent,
    registerRWSComponents,

    observable,
    attr 
};