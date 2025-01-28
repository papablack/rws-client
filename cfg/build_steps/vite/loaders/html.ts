import { IRWSViteLoader } from "./loader.type";

export default (): IRWSViteLoader => ({
    name: 'rws-html',
    async transform(code: string, id: string) {
        if (!id.endsWith('.html')) return null;
        
        // Process HTML files
        return {
            code,
            map: null
        };
    }
});