import { observable  } from '@microsoft/fast-element';

import RoutingService, { RWSRouter, _ROUTING_EVENT_NAME, RouteReturn, RoutingServiceInstance } from '../../services/RoutingService';
import RWSViewComponent from '../_component';


import ConfigService, { ConfigServiceInstance } from '../../services/ConfigService';
import UtilsService, { UtilsServiceInstance } from '../../services/UtilsService';
import  DOMService, { DOMServiceInstance, DOMOutputType } from '../../services/DOMService';
import ApiService, { ApiServiceInstance } from '../../services/ApiService';
import WSService, { WSServiceInstance } from '../../services/WSService';
import NotifyService, { NotifyServiceInstance } from '../../services/NotifyService';

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

    constructor(
        @RoutingService routingService: RoutingServiceInstance,
        @ConfigService config: ConfigServiceInstance, 
        @DOMService domService: DOMServiceInstance, 
        @UtilsService utilsService: UtilsServiceInstance,
        @ApiService apiService: ApiServiceInstance,
        @WSService wsService: WSServiceInstance,
        @NotifyService notifyService: NotifyServiceInstance
    ){
        super(config, domService, utilsService, apiService, wsService, notifyService);

        this.routing = routingService.apply(this);
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
        
        const newComponent: RWSViewComponent = this.DI.get<RWSViewComponent>(childComponent);

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

