import { IRWSViteLoader, SCSSLoaderParams } from "./loader.type";
import path from 'path';
import fs from 'fs';

const loader: IRWSViteLoader<SCSSLoaderParams> = async (params: SCSSLoaderParams) => ({
    name: 'rws-scss',
    enforce: 'pre',
    async transform(code: string, id: string) {
        
        if (!id.endsWith('.scss')) return null;
        
        if(code.indexOf('@save') > -1){
            const result = await params.scssPlugin.compileScssCode(
                code,
                path.dirname(id),                    
            );            

            const fileName: string = id.split('/').pop() as string;
            const dirName: string = params.cssOutputPath ? params.cssOutputPath : path.dirname(id);

            const fileNameArray = fileName.split('.');

            const newFileName: string = path.join(dirName, fileNameArray.at(-2) + '.css')

            
            fs.writeFileSync(newFileName, result.code);
        }
    
        return { code: '' };
    }
});

export default loader;