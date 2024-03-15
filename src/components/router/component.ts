import { observable  } from '@microsoft/fast-element';
import { DI, Container, inject } from "@microsoft/fast-foundation";
import { RWSRouter, _ROUTING_EVENT_NAME, RouteReturn } from '../../services/RoutingService';
import RWSViewComponent, { IRWSViewComponent, IWithCompose } from '../_component';
import {RWSView} from '../_decorator';
import RWSContainer from '../_container';

@RWSView('rws-router', { ignorePackaging: true })
export class RouterComponent extends RWSViewComponent {    
    static autoLoadFastElement = false;
    private routing: RWSRouter;
    private currentComponent: IRWSViewComponent;

    @observable currentUrl: string;
    @observable childComponents: HTMLElement[] = [];    
    slotEl: HTMLElement = null;

    connectedCallback() {
        super.connectedCallback();   
        this.routing = this.routingService.apply(this);       
        console.log(this.routing);

        if(this.currentUrl){
            this.handleRoute(this.routing.handleRoute(this.currentUrl));      
        }           
    }

    currentUrlChanged(oldValue: string, newValue: string){
        console.log(oldValue, newValue);
        // this.handleRoute(this.routing.handleRoute(newValue));
    }

    private handleRoute(route: RouteReturn){
        const [routeName, childComponent, routeParams] = route;

        this.$emit(_ROUTING_EVENT_NAME, {
            routeName,
            component: childComponent
       });
        
        const newComponent = document.createElement((childComponent as any).definition.name);        
        newComponent.routeParams = routeParams;

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

RouterComponent.defineComponent();