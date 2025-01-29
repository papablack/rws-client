import { Key } from '../_container';
import RWSViewComponent, { IWithCompose } from '../_component';
import { loadDep, getFunctionParamNames } from './_di';
import TheRWSService from '../../services/_service';
import { handleExternalChange } from '../_attrs/_external_handler';


type InjectDecoratorReturnType = (target: any, key?: string | number | undefined, parameterIndex?: number) => void;
type TargetType = any;

function addToComponentInjection(targetComponentName: string, constructor: any, depKey: string, dependencyClass: Key, isDefaultService: boolean = false){

    if(isDefaultService){
        targetComponentName = '_all';
    }

    if(!Object.keys(constructor._depKeys).includes(targetComponentName)){
        constructor._depKeys = { [targetComponentName]: [] };
    }

    if(!constructor._depKeys[targetComponentName].includes(depKey)){
        constructor._depKeys[targetComponentName].push(depKey);
    }

    if(!Object.keys(constructor._toInject).includes(depKey)){           
        const loadedDependency = loadDep<TheRWSService>(dependencyClass);
        constructor._toInject[depKey] = loadedDependency;
    }    
}

function RWSInject<T extends RWSViewComponent>(dependencyClass: Key, defaultService: boolean = false): InjectDecoratorReturnType {
    return (target: IWithCompose<T>, key?: keyof IWithCompose<T>, parameterIndex?: number) => {   
        if(key){
            const targetConstructor = typeof target === 'function' ? target : (target as any).constructor;              
            addToComponentInjection(targetConstructor.name, targetConstructor, key as string, dependencyClass, defaultService);
        } else{

            const targetConstructor = (target as any).prototype.constructor;    
          
            const paramNames = getFunctionParamNames(targetConstructor);               
            const depKey = paramNames[parameterIndex];       
            
            addToComponentInjection(targetConstructor.name, targetConstructor, depKey, dependencyClass, defaultService);
        }                        
    };
}

export {
    RWSInject    
};