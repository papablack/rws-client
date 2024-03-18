import { observable  } from '@microsoft/fast-element';
import { RWSRouter, _ROUTING_EVENT_NAME, RouteReturn } from '../../services/RoutingService';
import RWSViewComponent, { IRWSViewComponent } from '../_component';
import {RWSView} from '../_decorator';

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
            
        if(this.currentUrl){
            this.handleRoute(this.routing.handleRoute(this.currentUrl));      
        }           
    }

    currentUrlChanged(oldValue: string, newValue: string){  
        if(!this.routing){
            this.routing = this.routingService.apply(this);       

        }     
        this.handleRoute(this.routing.handleRoute(newValue));
    }

    private handleRoute(route: RouteReturn){
        const [routeName, childComponent, routeParams] = route;

        this.$emit(_ROUTING_EVENT_NAME, {
            routeName,
            component: childComponent
        });

        console.log('handleroute',{
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