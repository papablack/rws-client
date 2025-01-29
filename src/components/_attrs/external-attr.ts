import { 
    DecoratorAttributeConfiguration, 
    AttributeConfiguration,
    Observable,     
} from "@microsoft/fast-element";
import { handleExternalChange } from "./_external_handler";
import RWSViewComponent, { IWithCompose } from "../_component";

type ExAttrOpts = { converter?: (val: any) => string }
const _default_opts = {
    converter: (val: any) => {
        return val;
    }    
}

export function externalAttr(
    config?: DecoratorAttributeConfiguration, 
): (target: {}, property: string) => void;

export function externalAttr(target: {}, property: string, opts?: ExAttrOpts): void;
export function externalAttr(
    configOrTarget?: DecoratorAttributeConfiguration | {},
    property?: string,
    opts: ExAttrOpts = _default_opts
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
        config.converter = { fromView: opts.converter, toView: null };

        const attrs = AttributeConfiguration.locate($target.constructor);        
        RWSViewComponent.setExternalAttr(($target.constructor as IWithCompose<any>).name, $prop);        
        
        attrs.push(config);       
    }

    if (arguments.length > 1) {
        // Non invocation:
        // - @attr
        config = {} as any;
        decorator(configOrTarget!, property!);
        return;
    }

    // Invocation with or w/o opts:
    // - @attr()
    // - @attr({...opts})
    config = configOrTarget === void 0 ? ({} as any) : configOrTarget;
    return decorator;
}