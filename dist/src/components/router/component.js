var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { observable } from '@microsoft/fast-element';
import { _ROUTING_EVENT_NAME, RWSRoutingService as RoutingService } from '../../services/RoutingService';
import RWSViewComponent from '../_component';
export class RouterComponent extends RWSViewComponent {
    constructor() {
        super();
        this.childComponents = [];
        this.slotEl = null;
        this.routing = RoutingService.apply(this);
    }
    connectedCallback() {
        super.connectedCallback();
        this.handleRoute(this.routing.handleRoute(this.currentUrl));
    }
    currentUrlChanged(oldValue, newValue) {
        this.handleRoute(this.routing.handleRoute(this.currentUrl));
    }
    handleRoute(route) {
        const [routeName, childComponent, routeParams] = route;
        this.$emit(_ROUTING_EVENT_NAME, {
            routeName,
            component: childComponent
        });
        const newComponent = new childComponent(routeParams);
        if (this.currentComponent) {
            this.getShadowRoot().removeChild(this.currentComponent);
        }
        this.currentComponent = newComponent;
        this.getShadowRoot().appendChild(newComponent);
    }
    addComponent(component) {
        this.slotEl = component;
    }
}
RouterComponent.autoLoadFastElement = false;
RouterComponent.definition = {
    name: 'rws-router',
};
__decorate([
    observable,
    __metadata("design:type", String)
], RouterComponent.prototype, "currentUrl", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], RouterComponent.prototype, "childComponents", void 0);
//# sourceMappingURL=component.js.map