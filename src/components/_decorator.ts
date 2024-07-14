import RWSContainer from './_container';
import TheRWSService from '../services/_service';
import ConfigService from '../services/ConfigService';
import { loadRWSRichWindow } from '../types/RWSWindow';
import RWSViewComponent, { IWithCompose } from './_component';
import { InterfaceSymbol } from './_container';
import { RWSInject } from './_decorators/RWSInject';
import { ElementStyles, Observable, ViewTemplate } from '@microsoft/fast-element'; 
import { handleExternalChange } from './_attrs/_external_handler';

interface RWSDecoratorOptions {
    template?: string,
    styles?: string,
    fastElementOptions?: any,
    ignorePackaging?: boolean,
    debugPackaging?: boolean
    oreoMode?: boolean
}

//const _PARAMTYPES_METADATA_KEY = 'design:paramtypes';
type HtmlBinderType = (context: RWSViewComponent) => ViewTemplate;

function RWSView<Component extends RWSViewComponent>(name: string, data?: RWSDecoratorOptions | null, override?: { styles?: ElementStyles, template?: ViewTemplate, options?: any }): (type: any, args?: any) => void {
    return (theComponent: IWithCompose<Component>, args?: any) => {
        theComponent.definition = { name, template: null }

        if(override){
            if(override.styles){
                theComponent.definition.styles = override.styles;
            }

            if(override.template){
                theComponent.definition.template =  override.template;
            }

            
            if(override.options){
                (theComponent.definition as any).options = override.options;
            }
        }
    };
}


function RWSIgnore(params: { mergeToApp?: boolean } | null = null): () => void {
    return () => { };
}

function getParentConstructor(instance: any): any {
    const proto = Object.getPrototypeOf(instance.constructor.prototype);
    if (proto && proto.constructor) {
        return proto.constructor;
    }

    return null;
}


const applyConstructor = (component: RWSViewComponent, x: boolean = false): void => {
    const mainConstructor: any = component.constructor;
    const parent = getParentConstructor(component);
    

    if (parent.name !== 'RWSViewComponent' ) {
        return;
    }    
    

    const existingInjectedDependencies = (mainConstructor as IWithCompose<RWSViewComponent>)._toInject;

    const regServices = loadRWSRichWindow().RWS._registered;
    

    const depsToInject: string[] = (mainConstructor as IWithCompose<RWSViewComponent>)._depKeys[mainConstructor.name] || [];
    const depsInInjector: string[] = Object.keys(existingInjectedDependencies);

    const toInject: string[] = [...depsToInject]

    type KeyType = {[key: string]: TheRWSService | string };

    const _target = (component as any);
    
    function inject(services: KeyType){
        for (const prop in services) {
            const service = (typeof services[prop] === 'string' ? existingInjectedDependencies[prop] : services[prop]) as TheRWSService;      
            _target[prop] = service;            
        }
    }

    inject(toInject.reduce((acc: KeyType, cur) => {
        acc[cur] = cur;
        return acc;
      }, {}));

    const defaultDeps: [string, TheRWSService][] = Object.keys(existingInjectedDependencies)
        .filter((depKey: string) => existingInjectedDependencies[depKey].isDefault()).map((depKey => [depKey, existingInjectedDependencies[depKey]]));

    inject(defaultDeps.reduce((acc: KeyType, cur: [string, TheRWSService]) => {
        acc[cur[0]] = cur[1];
        return acc;
      }, {}));    

    inject({
        config: RWSContainer().get(ConfigService)
    })    

    if(Object.keys(RWSViewComponent._externalAttrs).includes((_target.constructor as IWithCompose<any>).name)){
        for(const exAttrKey in RWSViewComponent._externalAttrs[(_target.constructor as IWithCompose<any>).name]){  
            const exAttr = RWSViewComponent._externalAttrs[(_target.constructor as IWithCompose<any>).name][exAttrKey];          
            const notifier = Observable.getNotifier(_target);
            notifier.subscribe({
                handleChange(source, key) {                    
                    if (key === exAttr && !_target.__exAttrLoaded.includes(exAttr)) {                        
                        handleExternalChange(source, key);
                        _target.__exAttrLoaded.push(key);
                    }
                }
            }, exAttr);
        }    
    }
};

export { RWSView, RWSDecoratorOptions, RWSIgnore, RWSInject, applyConstructor };