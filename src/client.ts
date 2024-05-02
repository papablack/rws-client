import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify from './types/RWSNotify';

import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import UtilsService, { UtilsServiceInstance } from './services/UtilsService';
import DOMService, { DOMServiceInstance } from './services/DOMService';
import ApiService, { ApiServiceInstance } from './services/ApiService';
import NotifyService, { NotifyServiceInstance } from './services/NotifyService';
import RoutingService, { RoutingServiceInstance } from './services/RoutingService';
import WSService, { WSServiceInstance } from './services/WSService';
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';
import { IBackendRoute } from './services/ApiService';
import IRWSUser from './interfaces/IRWSUser';
import RWSWindow, { RWSWindowComponentRegister, loadRWSRichWindow } from './interfaces/RWSWindow';

import { DI, Container } from '@microsoft/fast-foundation';

import {
    IFrontRoutes
} from './services/RoutingService';

import RWSViewComponent, { IWithCompose } from './components/_component';
import RWSContainer from './components/_container';

interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    }
}

type RWSInfoType = { components: string[] };
type RWSEventListener = (event: CustomEvent) => void;

class RWSClient {
    private _container: Container;
    private user: IRWSUser = null;

    private config: IRWSConfig = {};
    protected initCallback: () => Promise<void> = async () => { };

    private isSetup = false;
    protected devStorage: { [key: string]: any } = {};

    private cfgSetupListener: RWSEventListener = (event: CustomEvent<{ callId: string }>) => {
        console.log('Received custom event from web component:', event.detail);
        // this.broadcastConfigForViewComponents();
    };

    constructor(
        @ConfigService public appConfig: ConfigServiceInstance,
        @RoutingService public routingService: RoutingServiceInstance,
        @DOMService public domService: DOMServiceInstance,
        @UtilsService public utilsService: UtilsServiceInstance,
        @ApiService public apiService: ApiServiceInstance,
        @WSService public wsService: WSServiceInstance,
        @ServiceWorkerService public swService: ServiceWorkerServiceInstance,
        @NotifyService public notifyService: NotifyServiceInstance
    ) {
        this._container = RWSContainer();
        this.user = this.getUser();

        this.pushDataToServiceWorker('SET_WS_URL', { url: this.appConfig.get('wsUrl') }, 'ws_url');

        if (this.user) {
            this.pushUserToServiceWorker({ ...this.user, instructor: false });
        }
    }

    async setup(config: IRWSConfig = {}): Promise<IRWSConfig> {
        if (this.isSetup) {
            return this.config;
        }

        this.config = { ...this.config, ...config };
        this.appConfig.mergeConfig(this.config);

        // this.on<IRWSConfig>('rws_cfg_call', this.cfgSetupListener);

        const hotModule: IHotModule = (module as IHotModule);

        if (hotModule.hot) {
            hotModule.hot.accept('./print.js', function () {
                console.log('Accepting the updated module!');
            });
        }

        if (this.appConfig.get('parted')) {
            await this.loadPartedComponents();            
        }


        this.isSetup = true;
        return this.config;
    }

    async start(config: IRWSConfig = {}): Promise<RWSClient> {
        this.config = { ...this.config, ...config };

        if (!this.isSetup) {
            this.config = await this.setup(this.config);
        }

        if (Object.keys(config).length) {
            this.appConfig.mergeConfig(this.config);
        }        

        if (this.config.user && !this.config.dontPushToSW) {
            this.pushUserToServiceWorker(this.user);
        }

        await startClient(this.appConfig, this.wsService, this.notifyService, this.routingService);        

        await this.initCallback();        

        return this;
    }

    addRoutes(routes: IFrontRoutes) {
        this.config.routes = routes;
    }

    setNotifier(notifier: RWSNotify): RWSClient {
        this.notifyService.setNotifier(notifier);

        return this;
    }

    setDefaultLayout(DefaultLayout: any): RWSClient {
        this.config.defaultLayout = DefaultLayout;

        return this;
    }

    setBackendRoutes(routes: IBackendRoute[]): RWSClient {
        this.config.backendRoutes = routes;
        return this;
    }

    async onInit(callback: () => Promise<void>): Promise<RWSClient> {
        this.initCallback = callback;
        return this;
    }

    pushDataToServiceWorker(type: string, data: any, asset_type: string = 'data_push'): void {
        let tries = 0;

        const doIt: () => void = () => {
            try {
                this.swService.sendDataToServiceWorker(type, data, asset_type);
            } catch (e) {
                if (tries < 3) {
                    setTimeout(() => { doIt(); }, 300);
                    tries++;
                }
            }
        };

        doIt();
    }

    pushUserToServiceWorker(userData: any) {
        this.setUser(userData);
        this.pushDataToServiceWorker('SET_USER', userData, 'logged_user');
    }

    getUser(): IRWSUser {

        const localSaved = localStorage.getItem('the_rws_user');

        if (localSaved) {
            this.setUser(JSON.parse(localSaved) as IRWSUser);
        }

        return this.user;
    }

    setUser(user: IRWSUser): RWSClient {
        if (!user || !user?.jwt_token) {
            console.warn('[RWS Client Warning]', 'Passed user is not valid', user);
            return this;
        }

        this.user = user;

        this.apiService.setToken(this.user.jwt_token);
        this.wsService.setUser(this.user);

        localStorage.setItem('the_rws_user', JSON.stringify(this.user));


        return this;
    }

    getConfig(): ConfigServiceInstance {
        return this.appConfig;
    }

    on<T>(eventName: string, listener: RWSEventListener): void {
        document.addEventListener(eventName, (event: Event) => {
            listener(event as CustomEvent<T>);
        });
    }

    setDevStorage(key: string, stuff: any): RWSClient {
        this.devStorage[key] = stuff;
        return this;
    }

    getDevStorage(key: string): any {
        return this.devStorage[key];
    }

    registerToDI(): void {

    }

    async loadPartedComponents(): Promise<void> {
        this.assignClientToBrowser();

        const componentParts: RWSInfoType = await this.apiService.get<RWSInfoType>(this.appConfig.get('partedDirUrlPrefix') + '/rws_info.json');        

        componentParts.components.forEach((componentName: string, key: number) => {
            const partUrl = `${this.appConfig.get('partedDirUrlPrefix')}/${this.appConfig.get('partedPrefix')}.${componentName}.js`;

            const script: HTMLScriptElement = document.createElement('script');
            script.src = partUrl;
            script.async = true;
            script.type = 'text/javascript';
            document.body.appendChild(script);

            console.log(`Appended ${componentParts.components[key]} component (${partUrl})`);
        });        
    }   
    
    async onDOMLoad(): Promise<void> {
        return new Promise<void>((resolve) => {
            document.addEventListener('DOMContentLoaded', () => {
                resolve();
            });
        });
    }

    assignClientToBrowser(): void {
        this.getBrowserObject().RWS.client = this;
    }

    enableRouting(): void {
        this.appConfig.mergeConfig({ routing_enabled: true });
    }

    disableRouting(): void {
        this.appConfig.mergeConfig({ routing_enabled: false });
    }

    private getBrowserObject(): RWSWindow {
        loadRWSRichWindow();
        return window;
    }


    private broadcastConfigForViewComponents(): void {
        document.dispatchEvent(new CustomEvent<{ config: IRWSConfig }>('rws_cfg_broadcast', { detail: { config: this.appConfig.getData() } }));
    }

    static getDI(): typeof DI {
        return DI;
    }

    static defineAllComponents() {
        const richWindowComponents: RWSWindowComponentRegister = (window as Window & RWSWindow).RWS.components;

        Object.keys(richWindowComponents).map(key => richWindowComponents[key].component).forEach((el: IWithCompose<RWSViewComponent>) => {
            el.define(el as any, el.definition);
        });
    }

    
    defineComponents(){
        const richWindowComponents: RWSWindowComponentRegister = (window as Window & RWSWindow).RWS.components;

        Object.keys(richWindowComponents).map(key => richWindowComponents[key].component).forEach((el: IWithCompose<RWSViewComponent>) => {
            el.define(el as any, el.definition);
        });
    }
}

export default DI.createInterface<RWSClient>(x => x.singleton(RWSClient));
export { IHotModule, RWSClient as RWSClientInstance };