import RWSViewComponent, { IWithCompose } from './_component';
import { RWSInject } from './_decorators/RWSInject';

import 'reflect-metadata';

interface RWSDecoratorOptions {
    template?: string,
    styles?: string,
    fastElementOptions?: any,
    ignorePackaging?: boolean
}

//const _PARAMTYPES_METADATA_KEY = 'design:paramtypes';

function RWSView<T extends RWSViewComponent>(name: string, data?: RWSDecoratorOptions): (type: any) => void {
    return (constructor: T) => {
    };
}

function RWSIgnore(params: { mergeToApp?: boolean } = null): () => void {
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
            console.log(`Assigned service to "${mainConstructor.name}(${depKey})":`, loadedDependency);
        }
    });
};

export { RWSView, RWSDecoratorOptions, RWSIgnore, RWSInject, applyConstructor };