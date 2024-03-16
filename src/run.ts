import { ConfigServiceInstance } from './services/ConfigService';
import { NotifyServiceInstance } from './services/NotifyService';
import { WSServiceInstance} from './services/WSService';

import { RoutingServiceInstance} from './services/RoutingService';

const main = async (
    config: ConfigServiceInstance, 
    WSService: WSServiceInstance, 
    NotifyService: NotifyServiceInstance, 
    RoutingService: RoutingServiceInstance
): Promise<boolean> => {        
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