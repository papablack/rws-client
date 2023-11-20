import { FASTElement } from "@microsoft/fast-element";
import config from "../services/ConfigService";
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
}

export default RWSViewComponent;