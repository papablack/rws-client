import { 
    DecoratorAttributeConfiguration, 
    AttributeConfiguration,
    Observable,     
} from "@microsoft/fast-element";
import { handleExternalChange } from "./_external_handler";
import RWSViewComponent, { IWithCompose } from "../_component";

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
    let config: AttributeConfiguration;

    function decorator($target: {}, $prop: string): void {
        if (arguments.length > 1) {
            // Non invocation:
            // - @attr
            // Invocation with or w/o opts:
            // - @attr()
            // - @attr({...opts})
            config.property = $prop;
        }

        config.mode = 'fromView';        
        config.converter = {
            toView: null,
            fromView: (val: any) => {
                if(val && val.indexOf('{{') > -1){
                    return undefined;
                }                               

                return val;
            }
        }                        

        const attrs = AttributeConfiguration.locate($target.constructor);        
        RWSViewComponent.setExternalAttr(($target.constructor as IWithCompose<any>).name, $prop);        
        
        attrs.push(config);            

       
    }

    if (arguments.length > 1) {
        // Non invocation:
        // - @attr
        config = {} as any;
        decorator(configOrTarget!, prop!);
        return;
    }

    // Invocation with or w/o opts:
    // - @attr()
    // - @attr({...opts})
    config = configOrTarget === void 0 ? ({} as any) : configOrTarget;
    return decorator;
}
