import RWSViewComponent, { IWithCompose } from './_component';
import { RWSInject } from './_decorators/RWSInject';
import { ElementStyles, ViewTemplate } from '@microsoft/fast-element'; 
import 'reflect-metadata';

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
    const defaultDeps = (mainConstructor as IWithCompose<RWSViewComponent>)._depKeys['_all'] || [];
    const depsToInject = (mainConstructor as IWithCompose<RWSViewComponent>)._depKeys[mainConstructor.name] || [];

    Object.keys(existingInjectedDependencies).forEach((depKey: string) => {        
        // console.log(`Checking "${mainConstructor.name}" for "${depKey}"`, [...defaultDeps, ...depsToInject]);

        if ([...defaultDeps, ...depsToInject].includes(depKey)) {
            const loadedDependency = existingInjectedDependencies[depKey];     
            (component as any)[depKey] = loadedDependency;
        }
    });
};

export { RWSView, RWSDecoratorOptions, RWSIgnore, RWSInject, applyConstructor };