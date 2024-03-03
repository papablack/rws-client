/// <reference types="node" />
import IRWSConfig from './interfaces/IRWSConfig';
import RWSNotify from './types/RWSNotify';
import { IFrontRoutes } from './services/RoutingService';
import { IBackendRoute } from './services/ApiService';
import IRWSUser from './interfaces/IRWSUser';
interface IHotModule extends NodeModule {
    hot?: {
        accept(dependencies: string[], callback?: (updatedDependencies: string[]) => void): void;
        accept(dependency: string, callback?: () => void): void;
        accept(errHandler?: (err: Error) => void): void;
        dispose(callback: (data: any) => void): void;
    };
}
export default class RWSClient {
    private user;
    private config;
    protected initCallback: () => Promise<void>;
    private isSetup;
    constructor();
    setup(config?: IRWSConfig): Promise<IRWSConfig>;
    start(config?: IRWSConfig): Promise<RWSClient>;
    addRoutes(routes: IFrontRoutes): void;
    setNotifier(notifier: RWSNotify): RWSClient;
    setDefaultLayout(DefaultLayout: any): RWSClient;
    setBackendRoutes(routes: IBackendRoute[]): RWSClient;
    onInit(callback: () => Promise<void>): Promise<RWSClient>;
    pushDataToServiceWorker(type: string, data: any, asset_type?: string): void;
    pushUserToServiceWorker(userData: any): void;
    getUser(): IRWSUser;
    setUser(user: IRWSUser): RWSClient;
    private enableRouting;
}
export { IHotModule };
