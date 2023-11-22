import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';

import NotifyService from './services/NotifyService';
import RoutingService, { IFrontRoutes } from './services/RoutingService';

import RWSViewComponent from './components/_component';
import ApiService, { IBackendRoute } from './services/ApiService';
import rwsConfig from './services/ConfigService';
import { RouterComponent } from './components/router/component';

import { 
    allComponents, 
    provideFASTDesignSystem 
} from "@microsoft/fast-components";

class RWSClient {   
    private config: IRWSConfig = { backendUrl: '', routes: {} };

    async start(config: IRWSConfig): Promise<boolean> {    
        this.config = {...this.config, ...config};                    

        rwsConfig(this.config);  
        
        provideFASTDesignSystem().register(allComponents);

        await startClient();
    
        return true;
    }

    public addRoutes(routes: IFrontRoutes){
        this.config.routes = routes;
    }

    public setNotifier(notifier: RWSNotify)
    {
        NotifyService.setNotifier(notifier);
    }

    public setDefaultLayout(DefaultLayout: any) {
        this.config.defaultLayout = DefaultLayout;
    }

    public setBackendRoutes(routes: IBackendRoute[]) {
        this.config.backendRoutes = routes;            
    }

    private enableRouting(): void
    {
        
    }
}

export default RWSClient;
export { NotifyUiType, NotifyLogType, RoutingService, NotifyService, RWSViewComponent, ApiService,  RouterComponent}