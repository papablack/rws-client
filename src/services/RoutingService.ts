import TheService from './_service';

import Router from 'url-router';
import RWSViewComponent from '../components/_component';
import { RouterComponent } from '../components/router/component';
import UtilsService, {UtilsServiceInstance} from './UtilsService';


type IFrontRoutes = Record<string, unknown>; 
type RouteReturn = [string, typeof RWSViewComponent, Record<string, string>];

type IRWSRouteResult = {
  handler: () => RouteReturn;
  params: Record<string, string>;
};

class RWSRouter {
    private baseComponent: RWSViewComponent;
    private urlRouter: Router<any>;
    private utilsService: UtilsServiceInstance;

    constructor(routerComponent: RWSViewComponent, urlRouter: Router<any>, utilsService: UtilsServiceInstance){
        this.baseComponent = routerComponent;
        this.urlRouter = urlRouter;
        this.utilsService = utilsService;

        window.addEventListener('popstate', (event: Event) => {
            console.log('pop', event);
        });
    }

    public routeComponent(newComponent: RWSViewComponent)
    {
        this.baseComponent.append(newComponent);
    }

    public fireHandler(route: IRWSRouteResult): RouteReturn
    {     const handler = route.handler();
        return [handler[0], handler[1], this.utilsService.mergeDeep(route.params, handler[2])];
    }

    public handleRoute(url: string): RouteReturn
    {
        const currentRoute = this.find(url);    

        if (history.pushState) {
            window.history.pushState({ path: url }, '', url);
        }

        return this.fireHandler(currentRoute);
    }

    public handleCurrentRoute(): RouteReturn
    {
        const currentRoute = this.find(window.location.pathname);    

        return this.fireHandler(currentRoute);
    }

    public find(url: string): IRWSRouteResult
    {
        return this.urlRouter.find(url);
    }
}

class RoutingService extends TheService {
    private router: Router<any>;
    private routes: IFrontRoutes;
    private utilsService: UtilsServiceInstance;

    constructor(@UtilsService utilsService: UtilsServiceInstance){
        super();        

        this.utilsService = utilsService;
    }

    public initRouting(routes: IFrontRoutes)
    {
        this.routes = routes;
        this.router = new Router(this.routes);

        RouterComponent.defineComponent();
    }

    public apply(comp: RWSViewComponent): RWSRouter
    {
        return new RWSRouter(comp, this.router, this.utilsService);
    }

    public routeHandler = (comp: typeof RWSViewComponent) => () => {
        return comp;
    };  

    public getRoutes(): IFrontRoutes
    {
        return this.routes;
    }
}

const renderRouteComponent = (routeName: string, cmp: typeof RWSViewComponent, defaultRouteParams: any = {}) => (): [string, typeof RWSViewComponent, any] => [routeName, cmp, defaultRouteParams];

const _ROUTING_EVENT_NAME = 'routing.route.change';
interface IRoutingEvent {
  routeName: string,
  component: typeof RWSViewComponent
}

export default RoutingService.getSingleton();
export { RoutingService as RoutingServiceInstance, IFrontRoutes, RWSRouter, RouterComponent, IRWSRouteResult, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent};