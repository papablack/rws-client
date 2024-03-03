import TheService from './_service';
import Router from 'url-router';
import { RouterComponent } from '../components/router/component';
import { RWSUtilsService as UtilsService } from './UtilsService';
class RWSRouter {
    constructor(routerComponent, urlRouter) {
        this.baseComponent = routerComponent;
        this.urlRouter = urlRouter;
        window.addEventListener('popstate', (event) => {
            console.log('pop', event);
        });
    }
    routeComponent(newComponent) {
        this.baseComponent.append(newComponent);
    }
    fireHandler(route) {
        const handler = route.handler();
        return [handler[0], handler[1], UtilsService.mergeDeep(route.params, handler[2])];
    }
    handleRoute(url) {
        const currentRoute = this.find(url);
        if (history.pushState) {
            window.history.pushState({ path: url }, '', url);
        }
        return this.fireHandler(currentRoute);
    }
    handleCurrentRoute() {
        const currentRoute = this.find(window.location.pathname);
        return this.fireHandler(currentRoute);
    }
    find(url) {
        return this.urlRouter.find(url);
    }
}
class RoutingService extends TheService {
    constructor() {
        super();
        this.routeHandler = (comp) => () => {
            return comp;
        };
    }
    initRouting(routes) {
        this.routes = routes;
        this.router = new Router(this.routes);
        RouterComponent.defineComponent();
    }
    apply(comp) {
        return new RWSRouter(comp, this.router);
    }
    getRoutes() {
        return this.routes;
    }
}
const renderRouteComponent = (routeName, cmp, defaultRouteParams = {}) => () => [routeName, cmp, defaultRouteParams];
const _ROUTING_EVENT_NAME = 'routing.route.change';
export default RoutingService;
const RWSRoutingService = RoutingService.getSingleton();
export { RWSRouter, RouterComponent, renderRouteComponent, _ROUTING_EVENT_NAME, RWSRoutingService };
//# sourceMappingURL=RoutingService.js.map