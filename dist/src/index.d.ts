import IRWSConfig from './interfaces/IRWSConfig';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyService from './services/NotifyService';
import RoutingService, { IFrontRoutes, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent } from './services/RoutingService';
import DOMService, { DOMOutputType } from './services/DOMService';
import RWSViewComponent from './components/_component';
import RWSView from './components/_decorator';
import ApiService, { IBackendRoute } from './services/ApiService';
import RWSService from './services/_service';
import WSService from './services/WSService';
import { RouterComponent } from './components/router/component';
import registerRWSComponents from './components/index';
declare class RWSClient {
    private config;
    protected initCallback: () => Promise<void>;
    start(config: IRWSConfig): Promise<boolean>;
    addRoutes(routes: IFrontRoutes): void;
    setNotifier(notifier: RWSNotify): void;
    setDefaultLayout(DefaultLayout: any): void;
    setBackendRoutes(routes: IBackendRoute[]): void;
    onInit(callback: () => Promise<void>): Promise<void>;
    private enableRouting;
}
export default RWSClient;
export { NotifyUiType, NotifyLogType, RouteReturn, _ROUTING_EVENT_NAME, NotifyService, IRoutingEvent, ApiService, WSService, RoutingService, DOMService, DOMOutputType, RWSViewComponent, RWSView, RWSService, RouterComponent, renderRouteComponent, registerRWSComponents, observable, attr };
