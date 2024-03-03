import RWSViewComponent from '../_component';
export declare class RouterComponent extends RWSViewComponent {
    static autoLoadFastElement: boolean;
    private routing;
    private currentComponent;
    currentUrl: string;
    static definition: {
        name: string;
    };
    childComponents: HTMLElement[];
    slotEl: HTMLElement;
    constructor();
    connectedCallback(): void;
    currentUrlChanged(oldValue: string, newValue: string): void;
    private handleRoute;
    addComponent(component: any): void;
}
