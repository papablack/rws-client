import { Key } from '@microsoft/fast-foundation';
import RWSViewComponent, { IWithCompose } from './_component';
import RWSContainer from './_container';
import 'reflect-metadata';
import { RWSPlugin, { IPluginCompose } } from 'src/_plugin';

interface RWSDecoratorOptions {
    template?: string,
    styles?: string,
    fastElementOptions?: any,
    ignorePackaging?: boolean
}

type InjectDecoratorReturnType = (target: any, key?: string | number | undefined, parameterIndex?: number) => void;

//const _PARAMTYPES_METADATA_KEY = 'design:paramtypes';

function RWSInject<T extends RWSViewComponent>(dependencyClass: Key): InjectDecoratorReturnType {
    return (target: IWithCompose<T>, key?: keyof IWithCompose<T>, parameterIndex?: number) => {
        const loadedDependency = RWSContainer().get(dependencyClass);    
        const paramNames = getFunctionParamNames(target.prototype.constructor);
        target.prototype.constructor._toInject[paramNames[parameterIndex]] = loadedDependency;
    };
}

function RWSPluginDetector<T extends RWSPlugin>(): InjectDecoratorReturnType {
    return (constructor: T) => {
    };
}

function RWSView<T extends RWSViewComponent>(name: string, data?: RWSDecoratorOptions): (type: any) => void {
    return (constructor: T) => {
    };
}

function RWSIgnore(params: { mergeToApp?: boolean } = null): () => void {
    return () => { };
}

function getFunctionParamNames(func: () => any): string[] {
    // Convert the function to its string form and extract the parameter names
    const funcStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '');  
    return funcStr.slice(funcStr.indexOf('(')+1, funcStr.indexOf(')')).split(',');
}


function getParentConstructor(instance: any): any 
{
    const proto = Object.getPrototypeOf(instance.constructor.prototype);
    if (proto && proto.constructor) {
        return proto.constructor;
    }

    return null;
}

const applyConstructor = (component: RWSViewComponent): void => {
    let mainConstructor = component.constructor;
    const parent = getParentConstructor(component);

    if(!mainConstructor.length){
        mainConstructor = parent;
    }   
    
    let topConstructor = mainConstructor;

    if( parent && parent.name === RWSViewComponent.name){ 
        topConstructor = parent;
    }
    
    const existingInjectedDependencies = (topConstructor as IWithCompose<RWSViewComponent>)._toInject;

    Object.keys(existingInjectedDependencies).forEach((depKey: string) => {
        const loadedDependency = existingInjectedDependencies[depKey];
        if(!(component as any)[depKey]){
            (component as any)[depKey] = loadedDependency;
        }        
    });    
};

const applyProp = (component: RWSViewComponent, propName: string | symbol): any => {
    let mainConstructor = component.constructor;
    const parent = getParentConstructor(component);

    if(!mainConstructor.length){
        mainConstructor = parent;
    }   
    
    let topConstructor = mainConstructor;

    if( parent && parent.name === RWSViewComponent.name){ 
        topConstructor = parent;
    }

    if(typeof propName !== 'string'){
        propName = propName.toString();
    }
    
    const existingInjectedDependencies = (topConstructor as IWithCompose<RWSViewComponent>)._toInject;

    // console.log(propName);
    if(!Object.keys(existingInjectedDependencies).includes(propName)){
        return null;
    }

    const loadedDependency = existingInjectedDependencies[propName];

    if(!(component as any)[propName]){
        (component as any)[propName] = loadedDependency;
    }
    

    return loadedDependency;
};

export { RWSView, RWSDecoratorOptions, RWSIgnore, RWSInject, applyConstructor, applyProp, RWSPluginDetector };