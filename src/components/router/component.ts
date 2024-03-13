import { observable  } from '@microsoft/fast-element';
import { DI, Container, inject } from "@microsoft/fast-foundation";
import { RWSRouter, _ROUTING_EVENT_NAME, RouteReturn } from '../../services/RoutingService';
import RWSViewComponent, { IRWSViewComponent } from '../_component';
import RWSView from '../_decorator';

@RWSView('rws-router', { ignorePackaging: true })
export class RouterComponent extends RWSViewComponent {    
    static autoLoadFastElement = false;
    private routing: RWSRouter;
    private currentComponent: IRWSViewComponent;

    @observable currentUrl: string;
    @observable childComponents: HTMLElement[] = [];    
    slotEl: HTMLElement = null;

    @inject(Container)
    private DI: Container;

    connectedCallback() {
        super.connectedCallback();            
        this.routing = this.routingService.apply(this);        
        this.handleRoute(this.routing.handleRoute(this.currentUrl));        
    }

    currentUrlChanged(oldValue: string, newValue: string){
        
        this.handleRoute(this.routing.handleRoute(this.currentUrl));
    }

    private handleRoute(route: RouteReturn){
        const [routeName, childComponent, routeParams] = route;

        this.$emit(_ROUTING_EVENT_NAME, {
            routeName,
            component: childComponent
       });
        
        const newComponent: IRWSViewComponent = this.DI.get<typeof childComponent>(childComponent);

        newComponent.passRouteParams(routeParams);

        if(this.currentComponent){
            this.getShadowRoot().removeChild(this.currentComponent);
            
        }
        
        this.currentComponent = newComponent;

        this.getShadowRoot().appendChild(newComponent);
    }

    addComponent(component: any) {
        
        this.slotEl = component;
    }
}

