import TheService from './_service';
import ApiService, {ApiServiceInstance} from './ApiService';

import { RawSourceMap  } from 'source-map';

class UtilsService extends TheService {    
    static _DEFAULT: boolean = true;
    mergeDeep<T>(target: T | any, source: T  | any): T 
    {
        const isObject = (obj: any) => obj && typeof obj === 'object';

        if (!isObject(target) || !isObject(source)) {
            return source;
        }

        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                target[key] = targetValue.concat(sourceValue);
            } else if (isObject(targetValue) && isObject(sourceValue)) {
                target[key] = this.mergeDeep(Object.assign({}, targetValue), sourceValue);
            } else {
                target[key] = sourceValue;
            }
        });

        return target;
    }

    async fetchSourceMap(jsFilePath: string): Promise<RawSourceMap> 
    {
        // Assuming the source map URL is the JS file URL with a '.map' extension
        const sourceMapUrl = jsFilePath;

        try {
            const response = await fetch(sourceMapUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch source map:', error);
            return null;
        }
    }

    async getCurrentLineNumber(error: Error = null): Promise<number> {
        if(!error){
            error = new Error();
        }  
        
        return 0;
    }    
}

export default UtilsService.getSingleton();

export { UtilsService as UtilsServiceInstance };
