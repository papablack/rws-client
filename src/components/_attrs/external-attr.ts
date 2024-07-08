import { Observable, AttributeConfiguration, DecoratorAttributeConfiguration } from '@microsoft/fast-element';
import RWSViewComponent from '../_component';

type TargetType = RWSViewComponent;  // Use a more generic type for the target to ensure compatibility

function externalAttr(configOrTarget?: DecoratorAttributeConfiguration | TargetType, prop?: string): void | any 
{    

    console.log('EXATTR');
    if (arguments.length > 1) {
        // Decorator used directly without factory invocation
        // Apply the decorator immediately without returning anything
        applyDecorator(configOrTarget as RWSViewComponent, prop!);
    } else {
        // Decorator factory invocation
        const config = configOrTarget as AttributeConfiguration;
        // Return a function that applies the decorator, conforming to TypeScript's expectations for decorator factories
        return (target: TargetType, property: string) => applyDecorator(target, property, config);
    }
}

function applyDecorator(target: TargetType, prop: string, config: AttributeConfiguration | any = {}): void 
{    
    if (arguments.length > 1) {  
        config.property = prop;
    }

    AttributeConfiguration.locate(target.constructor).push(config);
    modifyPropertyDescriptor(target, prop);
}



function modifyPropertyDescriptor(target: any, propertyKey: string): void {
    const privatePropName = `_${String(propertyKey)}`;
    Object.defineProperty(target, privatePropName, {
        writable: true,
        value: target[propertyKey],
    });

    Object.defineProperty(target, propertyKey, {
        get() {            
            return this[privatePropName] as string;
        },
        set(value: any) {                
            if (typeof value !== 'string') {                    
                this[privatePropName] = null; // Set to null if condition is met
            } else {
                this[privatePropName] = value;
            }
            Observable.notify(this, propertyKey);
        },
    });
}
  

export { externalAttr };