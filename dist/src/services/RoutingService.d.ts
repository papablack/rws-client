import TheService from "./_service";
import Router from 'url-router';
import RWSViewComponent from "../components/_component";
import { RouterComponent } from "../components/router/component";
type IFrontRoutes = Record<string, unknown>;
type RouteReturn = [string, typeof RWSViewComponent, Record<string, string>];
type IRWSRouteResult = {
    handler: () => RouteReturn;
    params: Record<string, string>;
};
declare class RWSRouter {
    private baseComponent;
    private urlRouter;
    constructor(routerComponent: RWSViewComponent, urlRouter: Router<any>);
    routeComponent(newComponent: RWSViewComponent): void;
    fireHandler(route: IRWSRouteResult): RouteReturn;
    handleRoute(url: string): RouteReturn;
    handleCurrentRoute(): RouteReturn;
    find(url: string): IRWSRouteResult;
}
declare class RoutingService extends TheService {
    private router;
    private routes;
    constructor();
    initRouting(routes: IFrontRoutes): void;
    apply(comp: RWSViewComponent): RWSRouter;
    routeHandler: (comp: typeof RWSViewComponent) => () => typeof RWSViewComponent;
    getRoutes(): IFrontRoutes;
}
declare const renderRouteComponent: (routeName: string, cmp: typeof RWSViewComponent) => () => [string, typeof RWSViewComponent];
declare const _ROUTING_EVENT_NAME = "routing.route.change";
interface IRoutingEvent {
    routeName: string;
    component: typeof RWSViewComponent;
}
declare const _default: RoutingService;
export default _default;
export { IFrontRoutes, RWSRouter, RouterComponent, IRWSRouteResult, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent, };
