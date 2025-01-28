import { IRWSViteLoader } from "./loader.type";
import { RWSScssPlugin } from '../rws_scss_plugin';
import path from 'path';

export default (cssPlugin: RWSScssPlugin): IRWSViteLoader => ({
    name: 'rws-scss',
    async transform(code: string, id: string) {
        if (!id.endsWith('.scss')) return null;
        
        const result = await cssPlugin.compileScssCode(
            code,
            path.dirname(id) + '/styles',                    
        );
        
        return {
            code: result.code,
            map: null
        };
    }
});