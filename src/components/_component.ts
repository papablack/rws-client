import { FASTElement, ViewTemplate, ElementStyles, customElement, observable } from "@microsoft/fast-element";
import config from "../services/ConfigService";

import DOMService, { DOMOutputType } from '../services/DOMService';

interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}


class RWSViewComponent extends FASTElement {
    private static instances: RWSViewComponent[] = [];

    public routeParams: Record<string, string> = {};

    static autoLoadFastElement = true;

    @observable trashIterator: number = 0;

    constructor(routeParams: Record<string, string> =  null) {
        super();
        if(routeParams){
            this.routeParams = routeParams;
        }
    }

    connectedCallback() {
        super.connectedCallback();    

        if(!(this.constructor as any).definition && (this.constructor as any).autoLoadFastElement){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }
        
        RWSViewComponent.instances.push(this);
    } 

    private static getInstances(): RWSViewComponent[]
    {
        return RWSViewComponent.instances;
    }

    static defineComponent()
    {
        const def = (this as any).definition;        

        if(!def){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }

        FASTElement.define(this, def);
    }

    static getDefinition(tagName: string, htmlTemplate: ViewTemplate, styles: ElementStyles = null){                    
        const def: IFastDefinition = {
            name: tagName,
            template: htmlTemplate
        }

        if(styles){
            def.styles = styles;
        }

        return def;
    }

    on<T>(type: string, listener: (event: CustomEvent<T>) => any)
    {
        this.addEventListener(type, (baseEvent: Event) => {
            listener(baseEvent as CustomEvent<T>);
        });
    }

    $emitDown<T>(eventName: string, payload: T){
        this.$emit(eventName, payload, { 
            bubbles: true,
            composed:true
        });
    }

    parse$<T extends Element>(input: NodeListOf<T>, directReturn: boolean = false): DOMOutputType<T> {           
        return DOMService.parse$<T>(input, directReturn);
    }

    $<T extends Element>(selectors: string, directReturn: boolean = false): DOMOutputType<T> {                
        return DOMService.$<T>(this.getShadowRoot(), selectors, directReturn);
    }   

    async loadingString<T>(item: T, addContent: (cnt: string, error?: boolean) => void, shouldStop: (stopItem: T, addContent: (cnt: string, error?: boolean) => void) => Promise<boolean>) {
        let dots = 1;
        const maxDots = 3; // Maximum number of dots
        const interval = setInterval(async () => {
          const dotsString = '. '.repeat(dots);
          addContent(`${dotsString}`);
          dots = (dots % (maxDots)) + 1;

          if(await shouldStop(item, addContent)){
            clearInterval(interval)
          }
        }, 500);
    }

    async onDOMLoad(): Promise<void>
    {
        return new Promise<void>((resolve) => {
            if (this.getShadowRoot() !== null && this.getShadowRoot() !== undefined) {              
              resolve();
            } else {
              // If shadowRoot is not yet available, use MutationObserver to wait for it
              const observer = new MutationObserver(() => {
                if (this.getShadowRoot() !== null && this.getShadowRoot() !== undefined) {
                  observer.disconnect();
                  resolve();
                }
              });
              observer.observe(this, { childList: true, subtree: true });
            }
        });
    }
   

    protected getShadowRoot(): ShadowRoot
    {        
        const shRoot: ShadowRoot | null = this.shadowRoot;

        if(!shRoot){
            throw new Error(`Component ${(this.constructor as any).definition.name} lacks shadow root. If you wish to have component without shadow root extend your class with FASTElement`)
        }

        return shRoot;
    }

    static hotReplacedCallback() {
        this.getInstances().forEach(instance => instance.forceReload());
      }
    
    forceReload() {
        this.trashIterator += 1;
    }

    hotReplacedCallback() {
        this.forceReload();    
    }
}

export default RWSViewComponent;