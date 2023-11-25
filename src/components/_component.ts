import { FASTElement, ViewTemplate, ElementStyles } from "@microsoft/fast-element";
import config from "../services/ConfigService";

interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}

type $OutputType<T extends Element> = NodeListOf<T> | T | null;

class RWSViewComponent extends FASTElement {
    static autoLoadFastElement = true;

    connectedCallback() {
        super.connectedCallback();    

        if(!(this.constructor as any).definition && (this.constructor as any).autoLoadFastElement){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }
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

    parse$<T extends Element>(input: NodeListOf<T>, directReturn: boolean = false): $OutputType<T> {    
        if(input.length > 1 || directReturn) {
            return input;
        }
    
        if(input.length === 1) {
            return input[0];
        }
    
        return null;
    }

    $<T extends Element>(selectors: string, directReturn: boolean = false): $OutputType<T> {        
        const elements = this.getShadowRoot().querySelectorAll<T>(selectors);
        return elements ? this.parse$<T>(elements, directReturn) : null;    
    }

    protected getShadowRoot(): ShadowRoot
    {        
        const shRoot: ShadowRoot | null = this.shadowRoot;

        if(!shRoot){
            throw new Error(`Component ${(this.constructor as any).definition.name} lacks shadow root. If you wish to have component without shadow root extend your class with FASTElement`)
        }

        return shRoot;
    }
}

export default RWSViewComponent;