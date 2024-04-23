import { Key } from '@microsoft/fast-foundation';
import RWSContainer from '../_container';

function getFunctionParamNames(func: () => any): string[] {
    // Convert the function to its string form and extract the parameter names
    const funcStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '');  
    return funcStr.slice(funcStr.indexOf('(')+1, funcStr.indexOf(')')).split(',');
}

function loadDep<T>(dependencyKeyClass: Key): T
{    
    return RWSContainer().get(dependencyKeyClass) as T;
}

export { loadDep, getFunctionParamNames };
