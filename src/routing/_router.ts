import Router from 'url-router';
import {UtilsServiceInstance} from '../services/UtilsService';
import { IRWSViewComponent } from '../interfaces/IRWSViewComponent';
export type RouteReturn = [string, IRWSViewComponent, Record<string, string>];
export type IRWSRouteResult = {
    handler: () => RouteReturn;
    params: Record<string, string>;
};  

class RWSRouter {
    private baseComponent: IRWSViewComponent;
    private urlRouter: Router<any>;
    private utilsService: UtilsServiceInstance;

    constructor(routerComponent: IRWSViewComponent, urlRouter: Router<any>, utilsService: UtilsServiceInstance){
        this.baseComponent = routerComponent;
        this.urlRouter = urlRouter;
        this.utilsService = utilsService;

        window.addEventListener('popstate', (event: Event) => {
            console.log('pop', event);
        });
    }

    public routeComponent(newComponent: IRWSViewComponent)
    {
        this.baseComponent.appendChild(newComponent);
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

export { RWSRouter };