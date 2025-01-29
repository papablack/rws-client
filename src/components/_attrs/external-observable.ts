import { Observable, Accessor, observable as parentObservable} from '@microsoft/fast-element';

import RWSViewComponent from '../_component';
import { DefaultObservableAccessor } from './_default_observable_accessor';
import { ExternalObservableAccessor } from './_external_observable_accessor';


type ExternalObservableOptions = {} | unknown;

function isString(test: unknown){
    return typeof test === 'string';
}

function externalObservable(targetComponent: RWSViewComponent | unknown, nameOrAccessor: string | Accessor, opts: ExternalObservableOptions = null): void | any 
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
                return accessor.getValue(this);
            },
            set(this: any, newValue: any) {         
                const oldVal = accessor.getValue(this);       
                accessor.setValue(this, newValue);
                if(!!this['externalChanged']){
                    this['externalChanged'].call(accessor.name, oldVal, newValue);
                }
            },
        });
    }   
}
  

export { externalObservable };