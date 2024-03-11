import IRWSConfig from './interfaces/IRWSConfig';
import { ConfigServiceInstance } from './services/ConfigService';
import { NotifyServiceInstance } from './services/NotifyService';
import { WSServiceInstance} from './services/WSService';

import { RoutingServiceInstance} from './services/RoutingService';
import ApiService, { ApiServiceInstance } from "./services/ApiService";
import { DI } from "@microsoft/fast-foundation";

const main = async (): Promise<boolean> => {    
    const WSService = DI.getOrCreateDOMContainer().get<WSServiceInstance>(WSServiceInstance);
    const NotifyService = DI.getOrCreateDOMContainer().get<NotifyServiceInstance>(NotifyServiceInstance);
    const RoutingService = DI.getOrCreateDOMContainer().get<RoutingServiceInstance>(RoutingServiceInstance);

    const config = DI.getOrCreateDOMContainer().get<ConfigServiceInstance>(ConfigServiceInstance);

    
    RoutingService.initRouting(config.get('routes'));    

    if(config.get('backendUrl')){
        WSService.on('ws:disconnected', (instance, params) => {
            NotifyService.notify(`Your websocket client disconnected from the server. Your ID was <strong>${params.socketId}</strong>`, 'error');
        });

        WSService.on('ws:connected', (instance, params) => {
            NotifyService.notify('You are connected to websocket. Your ID is: <strong>' + instance.socket().id + '</strong>', 'info');
        });

        WSService.on('ws:reconnect', (instance, params) => {
            console.info('WS RECONNECTION ' + (params.reconnects + 1));
            NotifyService.notify('Your websocket client has tried to reconnect to server. Attempt #' + (params.reconnects+1), 'warning');
        });  

        WSService.init(config.get('wsUrl'), config.get('user'), config.get('transports'));
    }

    return true;
};

export default main;