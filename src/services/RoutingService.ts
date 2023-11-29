import TheService from "./_service";

import Router from 'url-router';
import RWSViewComponent from "../components/_component";
import { RouterComponent } from "../components/router/component";
import { FASTElement } from "@microsoft/fast-element";

type IFrontRoutes = Record<string, unknown>; 
type RouteReturn = [string, typeof RWSViewComponent];

type IRWSRouteResult = {
  handler: () => RouteReturn;
  params: Record<string, string>;
}

class RWSRouter {
  private baseComponent: RWSViewComponent;
  private urlRouter: Router<any>;
  
  constructor(routerComponent: RWSViewComponent, urlRouter: Router<any>){
    this.baseComponent = routerComponent;
    this.urlRouter = urlRouter;
  }

  public routeComponent(newComponent: RWSViewComponent)
  {
    this.baseComponent.append(newComponent);
  }

  public handleRoute(route: IRWSRouteResult): RouteReturn
  {
    return route.handler();
  }

  public handleCurrentRoute(): RouteReturn
  {
    const currentRoute = this.find(window.location.pathname);
    return this.handleRoute(currentRoute);
  }

  public find(url: string): IRWSRouteResult
  {
    return this.urlRouter.find(url);
  }
}

class RoutingService extends TheService {
  private router: Router<any>;
  private routes: IFrontRoutes;

  constructor(){
    super();        
  }

  public initRouting(routes: IFrontRoutes)
  {
    this.routes = routes;
    this.router = new Router(this.routes);

    RouterComponent.defineComponent();
  }

  public apply(comp: RWSViewComponent): RWSRouter
  {
    return new RWSRouter(comp, this.router);
  }

  public routeHandler = (comp: typeof RWSViewComponent) => () => {
    return comp;
  }  

  public getRoutes(): IFrontRoutes
  {
    return this.routes;
  }
}

const renderRouteComponent = (routeName: string, cmp: typeof RWSViewComponent) => (): RouteReturn => [routeName, cmp];

const _ROUTING_EVENT_NAME = 'routing.route.change';
interface IRoutingEvent {
  routeName: string,
  component: typeof RWSViewComponent
}

export default RoutingService.getSingleton();
export { IFrontRoutes, RWSRouter, RouterComponent, IRWSRouteResult, renderRouteComponent, RouteReturn, _ROUTING_EVENT_NAME, IRoutingEvent }