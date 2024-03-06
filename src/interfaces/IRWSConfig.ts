import { IFrontRoutes } from '../services/RoutingService';
import RWSViewComponent from '../components/_component';

export default interface IRWSConfig {
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
    pubPrefix?: string
    dontPushToSW?: boolean
    parted?: boolean
    splitFileDir?: string,
    splitPrefix?: string
}