import { 
    DecoratorAttributeConfiguration, 
    AttributeConfiguration,
    Observable,     
} from "@microsoft/fast-element";
import { handleExternalChange } from "./_external_handler";
import RWSViewComponent, { IWithCompose } from "../_component";
import { externalAttr } from "./external-attr";

export function ngAttr(
    config?: DecoratorAttributeConfiguration
): (target: {}, property: string) => void;

/**
 * Decorator:  Specifies an HTML attribute.
 * @param target - The class to define the attribute on.
 * @param prop - The property name to be associated with the attribute.
 * @public
 */
export function ngAttr(target: {}, prop: string): void;
export function ngAttr(
    configOrTarget?: DecoratorAttributeConfiguration | {},
    prop?: string
): void | ((target: {}, property: string) => void) {
    return externalAttr(configOrTarget, prop, {
        converter: (val: any) => {
            if(val && val.indexOf('{{') > -1){
                return undefined;
            }                               
    
            return val;
        }    
    })
}
