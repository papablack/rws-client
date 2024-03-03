import RWSService from 'rws-js-client/src/services/_service';
declare class ServiceWorkerService extends RWSService {
    registerServiceWorker(): Promise<void>;
    static registerServiceWorker(): Promise<void>;
    sendDataToServiceWorker(type: string, data: any, asset_type?: string): void;
}
declare const _default: ServiceWorkerService;
export default _default;
export { ServiceWorkerService as ServiceWorkerServiceInstance };
