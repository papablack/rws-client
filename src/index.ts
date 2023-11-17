import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';

import NotifyService from './services/NotifyService';
import RoutingService from './services/RoutingService';
import { Route } from '@microsoft/fast-router';
import RWSViewComponent from './components/_component';

class RWSClient {   
    private config: IRWSConfig = { backendUrl: '', routes: [] };

    async start(config: IRWSConfig): Promise<boolean> {    
        this.config = {...this.config, ...config};        
        await startClient(this.config);
    
        return true;
    }

    public addRoutes(routes: Route[]){
        this.config.routes = routes;
    }

    public setNotifier(notifier: RWSNotify)
    {
        NotifyService.setNotifier(notifier);
    }

    public setDefaultLayout(DefaultLayout: any) {
        this.config.defaultLayout = DefaultLayout;
    }
}

export default RWSClient;
export { NotifyUiType, NotifyLogType, RoutingService, NotifyService, RWSViewComponent }