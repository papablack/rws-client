import IRWSConfig from './interfaces/IRWSConfig';

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

import { DI, Container, Registration } from '@microsoft/fast-foundation';

import {
    IFrontRoutes
} from './services/RoutingService';

import RWSViewComponent, { IWithCompose } from './components/_component';
import RWSContainer from './components/_container';
import TheRWSService from './services/_service';

import ComponentHelper, { ComponentHelperStatic } from './client/components';
import ServicesHelper from './client/services';
import ConfigHelper from './client/config';

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
    protected _container: Container;
    protected user: IRWSUser = null;
    
    protected config: IRWSConfig = {};
    protected isSetup = false;
    protected devStorage: { [key: string]: any } = {};    
    protected customServices: { [serviceName: string]: TheRWSService} = {};
    protected defaultServices: { [serviceName: string]: TheRWSService} = {};

    private componentHelper = ComponentHelper.bind(this)();
    private servicesHelper = ServicesHelper.bind(this)();
    private configHelper = ConfigHelper.bind(this)();

    protected initCallback: () => Promise<void> = async () => { };    

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
        
        this.loadServices();

        this.pushDataToServiceWorker('SET_WS_URL', { url: this.appConfig.get('wsUrl') }, 'ws_url');

        if (this.user) {
            this.pushUserToServiceWorker({ ...this.user, instructor: false });
        }        
    }

    async setup(config: IRWSConfig = {}): Promise<IRWSConfig> {
        return this.configHelper.setup(config);
    }

    async start(config: IRWSConfig = {}): Promise<RWSClient> {
        return this.configHelper.start(config);
    }

    private loadServices(){
        return this.servicesHelper.loadServices();
    }

    get(key: string): any | null
    {
        return this.configHelper.get(key);
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
        this.configHelper.pushDataToServiceWorker(type, data, asset_type);

    }

    pushUserToServiceWorker(userData: any) {
        this.configHelper.pushUserToServiceWorker(userData);
    }

    getUser(): IRWSUser {
        return this.configHelper.getUser();
    }

    setUser(user: IRWSUser): RWSClient {
        return this.configHelper.setUser(user);
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
        return this.componentHelper.loadPartedComponents();
    }   
    
    async onDOMLoad(): Promise<void> {
        return this.domService.onDOMLoad()
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

    static getDI(): typeof DI {
        return DI;
    }

    static defineAllComponents() {
        ComponentHelperStatic.defineAllComponents();
    }

    
    defineComponents(){
        ComponentHelperStatic.defineAllComponents();
    }
}

export default DI.createInterface<RWSClient>(x => x.singleton(RWSClient));
export { IHotModule, RWSClient as RWSClientInstance };