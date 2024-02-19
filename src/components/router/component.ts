import { customElement, FASTElement, observable, html, ref, when  } from '@microsoft/fast-element';
import { isConstructorDeclaration } from 'typescript';

import RoutingService, { RWSRouter, _ROUTING_EVENT_NAME, RouteReturn } from '../../services/RoutingService';
import RWSViewComponent from '../_component';


export class RouterComponent extends RWSViewComponent {    
    static autoLoadFastElement = false;
    private routing: RWSRouter;
    private currentComponent: RWSViewComponent;

    @observable currentUrl: string;

    static definition = {
        name: 'rws-router',         
    };
    
    @observable childComponents: HTMLElement[] = [];    
    slotEl: HTMLElement = null;

    constructor(){
        super();                

        this.routing = RoutingService.apply(this);
    }

    connectedCallback() {
        super.connectedCallback();            
        
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

        const newComponent: RWSViewComponent = new childComponent(routeParams);   

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

