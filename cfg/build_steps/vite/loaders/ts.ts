import { IRWSViteLoader } from "./loader.type";
export default (): IRWSViteLoader => ({
    name: 'rws-typescript',
    async transform(code: string, id: string) {
        console.log({code});
        if (!id.endsWith('.ts')) return null;
        
        // Skip .debug.ts and .d.ts files
        if (id.endsWith('.debug.ts') || id.endsWith('.d.ts')) return null;
        
        // Skip non-@rws-framework node_modules
        if (id.includes('node_modules') && !id.includes('@rws-framework')) return null;

        return {
            code,
            map: null
        };
    }
});