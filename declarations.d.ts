// import RWSClient, { NotifyUiType, NotifyLogType, RouteReturn, _ROUTING_EVENT_NAME, NotifyService, IRoutingEvent, ApiService, WSService, RoutingService, DOMService, DOMOutputType, RWSViewComponent, renderRouteComponent, RWSView, RWSService, RouterComponent, observable, attr } from './dist/src/index';

// export default RWSClient;
// export { NotifyUiType, NotifyLogType, RouteReturn, _ROUTING_EVENT_NAME, NotifyService, IRoutingEvent, ApiService, WSService, RoutingService, DOMService, DOMOutputType, RWSViewComponent, renderRouteComponent, RWSView, RWSService, RouterComponent, observable, attr }

declare module '*.scss' {
    const content: import('@microsoft/fast-element').ElementStyles;
    export default content;
}

declare module '*.html' {
    const content: import('@microsoft/fast-element').ViewTemplate;
    export default content;
}