import { IRWSViteLoader, SCSSLoaderParams } from "./loader.type";
import path from 'path';

const loader: IRWSViteLoader<SCSSLoaderParams> = (params: SCSSLoaderParams) => ({
    name: 'rws-scss',
    async transform(code: string, id: string) {
        if (!id.endsWith('.scss')) return null;
        
        const result = await params.plugin.compileScssCode(
            code,
            path.dirname(id) + '/styles',                    
        );
        
        return {
            code: result.code,
            map: null
        };
    }
});

export default loader;