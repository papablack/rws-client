import RWSViewComponent from '../components/_component';
import { RWSPlugin, DefaultRWSPluginOptionsType } from '../plugins/_plugin';
import { IStaticRWSPlugin } from '../types/IRWSPlugin';

export type IFrontRoutes = Record<string, unknown>; 
export type RWSPluginEntry<T extends DefaultRWSPluginOptionsType = DefaultRWSPluginOptionsType> = new (...args: any[]) => RWSPlugin<T>;

export default interface IRWSConfig {
    [key: string]: any
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
    parted?: boolean,
    rwsDefines?: {[key: string]: any}
    partedFileDir?: string
    partedPrefix?: string
    plugins?: IStaticRWSPlugin[]
    routing_enabled?: boolean
    _noLoad?: boolean    
}