import TheService from './_service';
import ApiService, {ApiServiceInstance} from './ApiService';

import { RawSourceMap  } from 'source-map';

class UtilsService extends TheService {    
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

        // const stack = error.stack || '';
        // const stackLines = stack.split('\n');
        // const relevantLine = stackLines[1];

        // // Extract file path from the stack line
        // const match = relevantLine.match(/\((.*?):\d+:\d+\)/);
        // if (!match) return -1;
        // const filePath = match[1];

        // // Assuming the source map is in the same directory with '.map' extension
        // const sourceMapPath = `${filePath}.map`;    

        // if(sourceMap === null){
        //     sourceMap = await this.fetchSourceMap(sourceMapPath);       
        // }

        // let originalPosition: any = null;

        // await SourceMapConsumer.with(sourceMap, null, consumer => {
        //     const lineMatch = relevantLine.match(/:(\d+):(\d+)/);
        //     if (!lineMatch) return -1;
            
        //     originalPosition = consumer.originalPositionFor({
        //       line: parseInt(lineMatch[1]), // Example line and column
        //       column: parseInt(lineMatch[2])
        //     });            
        // });        
     
        // return originalPosition.line;
    }
}

export default UtilsService.getSingleton();

export { UtilsService as UtilsServiceInstance };
