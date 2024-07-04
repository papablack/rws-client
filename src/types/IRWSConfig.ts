import RWSViewComponent from '../components/_component';
import { RWSPlugin, DefaultRWSPluginOptionsType } from '../plugins/_plugin';

export type IFrontRoutes = Record<string, unknown>; 
export type PluginConstructor<T extends DefaultRWSPluginOptionsType> = new (options: T) => RWSPlugin<T>;
export type RWSPluginEntry<T extends DefaultRWSPluginOptionsType> = PluginConstructor<T> | [PluginConstructor<T>, T];

export default interface IRWSConfig {
    dev?: boolean
    defaultLayout?: typeof RWSViewComponent
    backendUrl?: string
    wsUrl?: string
    backendRoutes?: any[]
    apiPrefix?: string
    routes?: IFrontRoutes
    transports?: string[]
    user?: any
    ignoreRWSComponents?: boolean
    pubUrl?: string
    pubUrlFilePrefix?: string
    partedDirUrlPrefix?: string
    dontPushToSW?: boolean
    parted?: boolean
    partedFileDir?: string
    partedPrefix?: string
    plugins?: RWSPluginEntry<DefaultRWSPluginOptionsType | any>[]
    routing_enabled?: boolean
    _noLoad?: boolean    
}