import { customElement, FASTElement, observable, html, ref, when  } from "@microsoft/fast-element";
import RoutingService, { RWSRouter, _ROUTING_EVENT_NAME } from "../../services/RoutingService";
import RWSViewComponent from "../_component";


export class RouterComponent extends RWSViewComponent {    
    static autoLoadFastElement = false;
    private routing: RWSRouter;

    static definition = {
        name: 'rws-router',
        template: html<RouterComponent>`
        <div class="placeholder" ${ref('slotEl')}></div>
    `    
    };
    
    @observable childComponents: HTMLElement[] = [];    
    slotEl: HTMLElement = null;

    constructor(){
        super();                

        this.routing = RoutingService.apply(this);
    }

    connectedCallback() {
        super.connectedCallback();            
        
        const [routeName, childComponent] = this.routing.handleCurrentRoute();

        this.$emit(_ROUTING_EVENT_NAME, {
            routeName,
            component: childComponent
        });

        const newComponent: RWSViewComponent = new childComponent();                

        this.getShadowRoot().appendChild(newComponent);
    }

    addComponent(component: any) {
        
        this.slotEl = component;
    }
}

