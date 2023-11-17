import { FASTElement } from "@microsoft/fast-element";
import config from "../services/ConfigService";


class RWSViewComponent extends FASTElement {
    static autoLoadFastElement = true;

    constructor(){
        super();    

        if(!(this.constructor as any).definition && (this.constructor as any).autoLoadFastElement){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }
    } 
}

export default RWSViewComponent;