import { PluginOption } from 'vite';
import { RWSScssPlugin } from '../rws_scss_plugin';

export interface LoaderParams {
    dev: boolean
}

export interface TSLoaderParams extends LoaderParams {
    scssPlugin: RWSScssPlugin
    tsConfigPath: string
}

export interface SCSSLoaderParams extends LoaderParams {
    scssPlugin: RWSScssPlugin,
    cssOutputPath: string
}

export interface HTMLLoaderParams extends LoaderParams {
    
}

export type LoaderContent = {
    name: string,
    enforce?: string,
    transform(code: string, id: string): Promise<{ code: string, map: any } | null>
} | null;

export type IRWSViteLoader<P extends LoaderParams = LoaderParams> = (params: P) => PluginOption;