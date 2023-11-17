import { customElement, FASTElement, observable, html, ref  } from "@microsoft/fast-element";
import RoutingService, { RWSRouter } from "../../services/RoutingService";
import RWSViewComponent from "../_component";


export class RouterComponent extends RWSViewComponent{
    static autoLoadFastElement = false;
    private routing: RWSRouter;
    
    @observable childComponents: HTMLElement[] = [];
    placeholder: HTMLElement;

    constructor(){
        super();                

        this.routing = RoutingService.apply(this);                          
    }

    connectedCallback() {
        super.connectedCallback();
        this.placeholder = this.shadowRoot?.querySelector('.placeholder');
        const newViewComponent = this.routing.handleCurrentRoute();
        const newComponent = new newViewComponent();
        this.placeholder.appendChild(newComponent);
        
    }

    static getDefinition(){
        return {
            name: 'rws-router',
            template: html<RouterComponent>`<div class="placeholder"></div>`            
        }
    }
}