import startClient from './run';
import { observable, attr } from '@microsoft/fast-element';
import NotifyService from './services/NotifyService';
import RoutingService, { renderRouteComponent, _ROUTING_EVENT_NAME } from './services/RoutingService';
import DOMService from './services/DOMService';
import RWSViewComponent from './components/_component';
import ApiService from './services/ApiService';
import RWSService from './services/_service';
import WSService from './services/WSService';
import { RouterComponent } from './components/router/component';
import { provideFASTDesignSystem, allComponents } from '@microsoft/fast-components';
class RWSClient {
    constructor() {
        this.config = { backendUrl: '', routes: {} };
    }
    async start(config) {
        this.config = { ...this.config, ...config };
        provideFASTDesignSystem().register(allComponents);
        const hotModule = module;
        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function () {
                console.log('Accepting the updated module!');
            });
        }
        const packageInfo = "";
        await startClient(this.config);
        return true;
    }
    addRoutes(routes) {
        this.config.routes = routes;
    }
    setNotifier(notifier) {
        NotifyService.setNotifier(notifier);
    }
    setDefaultLayout(DefaultLayout) {
        this.config.defaultLayout = DefaultLayout;
    }
    setBackendRoutes(routes) {
        this.config.backendRoutes = routes;
    }
    enableRouting() {
    }
}
function RWSView(name) {
    return () => { };
}
export default RWSClient;
export { _ROUTING_EVENT_NAME, NotifyService, ApiService, WSService, RoutingService, DOMService, RWSViewComponent, renderRouteComponent, RWSView, RWSService, RouterComponent, observable, attr };
//# sourceMappingURL=index.js.map