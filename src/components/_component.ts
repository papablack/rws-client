import { FASTElement, ViewTemplate, ElementStyles } from "@microsoft/fast-element";
import config from "../services/ConfigService";

interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}

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

        this.define(this, def);
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
    

    on<T>(eventName: string, callback: (callbackEvent: CustomEvent<T>) => void)
    {
        this.addEventListener(eventName, (event: Event) => {
            const customEvent = event as CustomEvent<T>;           
            callback(customEvent);
        });
    }
}

export default RWSViewComponent;