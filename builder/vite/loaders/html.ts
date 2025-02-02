import { HTMLLoaderParams, IRWSViteLoader } from "./loader.type";

const loader: IRWSViteLoader<HTMLLoaderParams> = async (params: HTMLLoaderParams) => ({
    name: 'rws-html',
    async transform(code: string, id: string) {
        if (!id.endsWith('.html')) return null;
                
        return null;
    }
});

export default loader;