import { customElement, FASTElement, observable, html, ref, when  } from "@microsoft/fast-element";
import RoutingService, { RWSRouter } from "../../services/RoutingService";
import RWSViewComponent from "../_component";


export class RouterComponent extends RWSViewComponent{
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
        
        const childComponent = this.routing.handleCurrentRoute();
        const newComponent: RWSViewComponent = new childComponent();                

        this.getShadowRoot().appendChild(newComponent);
    }  

    addComponent(component: any) {
        
        this.slotEl = component;
    }
}