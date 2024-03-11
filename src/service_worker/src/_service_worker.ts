import IRWSUser from '../../interfaces/IRWSUser';

//@4DI
import { WSServiceInstance } from '../../services/WSService'
import { DI, Container } from "@microsoft/fast-foundation";

type SWMsgType = {
    command: string,
    asset_type?: string,
    params: any
};

abstract class RWSServiceWorker<UserType extends IRWSUser> {
    protected DI: Container;
    protected user: UserType = null;
    protected ignoredUrls: RegExp[] = [];
    protected wsService: WSServiceInstance
    protected regExTypes: { [key: string]: RegExp }  

    public workerScope: ServiceWorkerGlobalScope;

    protected static _instances: { [key: string]: RWSServiceWorker<IRWSUser> } | null = {};

    onInit(): Promise<void> { return; }   

    onInstall(): Promise<void> { return; }
    onActivate(): Promise<void> { return; }

    constructor(workerScope: ServiceWorkerGlobalScope, DI: Container){   
        this.DI = DI;     
        this.wsService = DI.get<WSServiceInstance>(WSServiceInstance);
        this.workerScope = workerScope;

        this.onInit().then(() => {
            this.workerScope.addEventListener('install', () => {
                console.log('Service Worker: Installed');
    
                this.onInstall();
            });
    
            this.workerScope.addEventListener('activate', () => {
                console.log('[SW] Service Worker: Activated'); 
                
                this.onActivate();
    
                return workerScope.clients.claim();
            });
        });
    }       

    sendMessageToClient = (clientId: string, payload: any) => {
        return this.workerScope.clients.get(clientId)
            .then((client: any) => {
                if (client) {
                    client.postMessage(payload);
                }
            });
    };

    getUser(): UserType
    {
        return this.user;
    }

    setUser(user: UserType): RWSServiceWorker<UserType>
    {
        this.user = user;        

        return this;
    }

    static create<T extends new (...args: any[]) => RWSServiceWorker<IRWSUser>>(this: T, workerScope: ServiceWorkerGlobalScope): InstanceType<T> 
    {
        const className = this.name;

        if (!RWSServiceWorker._instances[className]) {
            const WSService = DI.getOrCreateDOMContainer().get<WSServiceInstance>(WSServiceInstance);
            RWSServiceWorker._instances[className] = new this(workerScope, WSService);
        }

        return RWSServiceWorker._instances[className] as InstanceType<T>;
    }
}

export default RWSServiceWorker;

export { SWMsgType }