import SWService, { ServiceWorkerServiceInstance } from '../../services/ServiceWorkerService';
import RWSService from '../../services/_service';
declare const workerScope: ServiceWorkerGlobalScope;


abstract class RWSServiceWorker extends RWSService {
    protected ignoredUrls: RegExp[] = [];
    protected regExTypes: { [key: string]: RegExp }    

    constructor(){
        super();

        this.onInit().then(() => {
            
        });
    }

    async onInit(): Promise<void>
    {
        self.addEventListener('install', () => {
            console.log('Service Worker: Installed');
        });

        self.addEventListener('activate', () => {
            console.log('[SW] Service Worker: Activated');             

            return this.getWorkerScope().clients.claim();
        });
    }   

    sendMessageToClient = (clientId: string, payload: any) => {
        return this.getWorkerScope().clients.get(clientId)
            .then((client: any) => {
                if (client) {
                    client.postMessage(payload);
                }
            });
    };

    static create<T extends new (...args: any[]) => RWSService>(this: T): InstanceType<T> {  
        const go = RWSService.getSingleton.bind(this);                  
        return go() as InstanceType<T>;
    }

    getWorkerScope(): ServiceWorkerGlobalScope
    {
        return RWSServiceWorker.getWorkerScope();
    }

    static getWorkerScope(): ServiceWorkerGlobalScope
    {
        return workerScope;
    }
}

export default RWSServiceWorker;