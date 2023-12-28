import appConfig from "./services/ConfigService";
import NotifyService from "./services/NotifyService";
import WSService from "./services/WSService";
import RoutingService from "./services/RoutingService";
const main = async (cfg) => {
    //First config run for setting up data. Later just use appConfig().get() to obtain data.
    const config = appConfig(cfg);
    RoutingService.initRouting(config.get('routes'));
    if (cfg.backendUrl) {
        WSService.on('ws:disconnected', (instance, params) => {
            NotifyService.notify('Your websocket client disconnected from the server.', 'error');
        });
        WSService.on('ws:connected', (instance, params) => {
            NotifyService.notify('You are connected to websocket.', 'info');
        });
        WSService.on('ws:reconnect', (instance, params) => {
            console.info('WS RECONNECTION ' + (params.reconnects + 1));
            NotifyService.notify('Your websocket client has tried to reconnect to server. Attempt #' + (params.reconnects + 1), 'warning');
        });
        WSService.init(config.get('backendUrl'));
    }
    return true;
};
export default main;
//# sourceMappingURL=run.js.map