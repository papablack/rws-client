import startClient from './run';
import { NotifyService } from './services/NotifyService';
import { ApiService } from './services/ApiService';
import registerRWSComponents from './components';
import ServiceWorkerService from './services/ServiceWorkerService';
import { RWSWSService } from './services/WSService';
import appConfig from './services/ConfigService';
export default class RWSClient {
    constructor() {
        this.user = null;
        this.config = { backendUrl: '', routes: {} };
        this.initCallback = async () => { };
        this.isSetup = false;
        this.user = this.getUser();
        this.pushDataToServiceWorker('SET_WS_URL', { url: window.edrnaConfig.websocket_host + ':' + window.edrnaConfig.websocket_port }, 'ws_url');
        if (this.user) {
            this.pushUserToServiceWorker({ ...this.user, instructor: false });
        }
    }
    async setup(config = {}) {
        this.config = { ...this.config, ...config };
        appConfig(this.config);
        const hotModule = module;
        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function () {
                console.log('Accepting the updated module!');
            });
        }
        this.isSetup = true;
        return this.config;
    }
    async start(config = {}) {
        var _a;
        this.config = { ...this.config, ...config };
        if (!this.isSetup) {
            this.config = await this.setup(this.config);
        }
        if (this.config.user && !this.config.dontPushToSW) {
            this.pushUserToServiceWorker(this.user);
        }
        await startClient();
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.ignoreRWSComponents)) {
            registerRWSComponents();
        }
        await this.initCallback();
        return this;
    }
    addRoutes(routes) {
        this.config.routes = routes;
    }
    setNotifier(notifier) {
        NotifyService.setNotifier(notifier);
        return this;
    }
    setDefaultLayout(DefaultLayout) {
        this.config.defaultLayout = DefaultLayout;
        return this;
    }
    setBackendRoutes(routes) {
        this.config.backendRoutes = routes;
        return this;
    }
    async onInit(callback) {
        this.initCallback = callback;
        return this;
    }
    pushDataToServiceWorker(type, data, asset_type = 'data_push') {
        let tries = 0;
        const doIt = () => {
            try {
                ServiceWorkerService.sendDataToServiceWorker(type, data, asset_type);
            }
            catch (e) {
                if (tries < 3) {
                    setTimeout(() => { doIt(); }, 300);
                    tries++;
                }
            }
        };
        doIt();
    }
    pushUserToServiceWorker(userData) {
        this.setUser(userData);
        this.pushDataToServiceWorker('SET_USER', userData, 'logged_user');
    }
    getUser() {
        const localSaved = localStorage.getItem('the_rws_user');
        if (!!localSaved) {
            this.setUser(JSON.parse(localSaved));
        }
        return this.user;
    }
    setUser(user) {
        if (!user || !(user === null || user === void 0 ? void 0 : user.jwt_token)) {
            console.warn('[RWS Client Warning]', 'Passed user is not valid', user);
            return this;
        }
        this.user = user;
        ApiService.setToken(this.user.jwt_token);
        RWSWSService.setUser(this.user);
        localStorage.setItem('the_rws_user', JSON.stringify(this.user));
        return this;
    }
    enableRouting() {
    }
}
//# sourceMappingURL=client.js.map