import { IFrontRoutes } from "../services/RoutingService";
import RWSViewComponent from "../components/_component";
export default interface IRWSConfig {
    defaultLayout?: typeof RWSViewComponent;
    backendUrl?: string;
    backendRoutes?: any[];
    apiPrefix?: string;
    routes?: IFrontRoutes;
}
