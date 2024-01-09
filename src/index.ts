import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyService from './services/NotifyService';
import RoutingService, { IFrontRoutes, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent } from './services/RoutingService';
import DOMService, { DOMOutputType }  from './services/DOMService';
import RWSViewComponent from './components/_component';
import ApiService, { IBackendRoute } from './services/ApiService';
import RWSService from './services/_service';
import WSService from './services/WSService';
import { RouterComponent } from './components/router/component';
import { provideFASTDesignSystem, allComponents } from '@microsoft/fast-components';

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

    async start(config: IRWSConfig): Promise<boolean> {    
        this.config = {...this.config, ...config};                         
        
        provideFASTDesignSystem().register(allComponents);
        

        const hotModule:IHotModule = (module as IHotModule);

        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function() {
              console.log('Accepting the updated module!');              
            })
        }

        const packageInfo = "";
        
        await startClient(this.config);        
    
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

    private enableRouting(): void
    {
        
    }
}

function RWSView(name: string ): (type: Function) => void{
    return () => {}
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
    renderRouteComponent,
    RWSView,
    RWSService,
    RouterComponent,

    observable,
    attr 
}