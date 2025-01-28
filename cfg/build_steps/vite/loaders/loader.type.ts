import { RWSScssPlugin } from '../rws_scss_plugin';

export interface LoaderParams {
    dev: boolean
}

export interface TSLoaderParams extends LoaderParams {
    
}

export interface SCSSLoaderParams extends LoaderParams {
    plugin: RWSScssPlugin
}

export interface HTMLLoaderParams extends LoaderParams {
    
}

export interface LoaderContent {
    name: string,
    enforce?: string,
    transform(code: string, id: string): Promise<{ code: string, map: any } | null>
}

export type IRWSViteLoader<P extends LoaderParams = LoaderParams> = (params: P) => LoaderContent;