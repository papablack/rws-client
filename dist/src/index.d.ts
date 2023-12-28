import IRWSConfig from './interfaces/IRWSConfig';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyService from './services/NotifyService';
import RoutingService, { IFrontRoutes, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent } from './services/RoutingService';
import DOMService, { DOMOutputType } from './services/DOMService';
import RWSViewComponent from './components/_component';
import ApiService, { IBackendRoute } from './services/ApiService';
import RWSService from './services/_service';
import WSService from './services/WSService';
import { RouterComponent } from './components/router/component';
declare class RWSClient {
    private config;
    start(config: IRWSConfig): Promise<boolean>;
    addRoutes(routes: IFrontRoutes): void;
    setNotifier(notifier: RWSNotify): void;
    setDefaultLayout(DefaultLayout: any): void;
    setBackendRoutes(routes: IBackendRoute[]): void;
    private enableRouting;
}
declare function RWSView(name: string): (type: Function) => void;
export default RWSClient;
export { NotifyUiType, NotifyLogType, RouteReturn, _ROUTING_EVENT_NAME, NotifyService, IRoutingEvent, ApiService, WSService, RoutingService, DOMService, DOMOutputType, RWSViewComponent, renderRouteComponent, RWSView, RWSService, RouterComponent, observable, attr };

declare module '*.css' {
    const content: import('@microsoft/fast-element').ElementStyles;
    export default content;
}

declare module '*.scss' {
    const content: import('@microsoft/fast-element').ElementStyles;
    export default content;
}

declare module '*.html' {
    const content: import('@microsoft/fast-element').ViewTemplate;
    export default content;
}