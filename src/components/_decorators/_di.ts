
import RWSContainer, { Key } from '../_container';

function getFunctionParamNames(func: () => any): string[] {
    const constructorMatch = func.toString().match(/constructor\s*\(([^)]*)\)/);
    if (!constructorMatch) return null;
    return constructorMatch[1].split(',').map(param => param.trim());
}

function loadDep<T>(dependencyKeyClass: Key): T
{    
    return RWSContainer().get(dependencyKeyClass) as T;
}

export { loadDep, getFunctionParamNames };
