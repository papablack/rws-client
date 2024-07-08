import { Observable, Accessor, observable as parentObservable} from '@microsoft/fast-element';

import RWSViewComponent from '../_component';
import { DefaultObservableAccessor } from './_default_observable_accessor';
import { ExternalObservableAccessor } from './_external_observable_accessor';


type ExternalObservableOptions = {} | unknown;

function isString(test: unknown){
    return typeof test === 'string';
}

function externalAttr(targetComponent: RWSViewComponent | unknown, nameOrAccessor: string | Accessor, opts: ExternalObservableOptions = null): void | any 
{        

    const target = targetComponent as any;
    const propName = typeof nameOrAccessor === 'string' ? nameOrAccessor : nameOrAccessor.name;


    if (isString(nameOrAccessor)) {
        nameOrAccessor = new DefaultObservableAccessor(propName);
    }    

    const defaultAccessor: Accessor = nameOrAccessor as Accessor;
    const extendedAccessor = new ExternalObservableAccessor(propName);

    const accessors: Accessor[] = [
        defaultAccessor,
        extendedAccessor
    ];

    for (const accessor of accessors){
        Observable.getAccessors(target).push(accessor);

        Reflect.defineProperty(target, accessor.name, {
            enumerable: true,
            get(this: any) {
                if(typeof this[propName] === 'string' && this[propName].indexOf('{{') == -1){
                    return accessor.getValue(this);
                }else{
                    return null;
                }
            },
            set(this: any, newValue: any) {        
                if(isString){
                    if(typeof newValue !== 'string'){
                        console.warn(`@deprecated: Prop ${propName} is not a "string" type. Any @attr and simillar decorators needs to be a string. To be removed in RWS 4.`)
                    }
                }     
                if(typeof newValue === 'string' && newValue.indexOf('{{') == -1){
                    accessor.setValue(this, newValue);
                }                   
            },
        });
    }   
}
  

export { externalAttr };