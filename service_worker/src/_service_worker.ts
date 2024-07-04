import IRWSUser from '../../src/types/IRWSUser';
import RWSContainer from '../../src/components/_container';

//@4DI
import { Container } from '../../src/components/_container';

type SWMsgType = {
    command: string,
    asset_type?: string,
    params: any
};

abstract class RWSServiceWorker<UserType extends IRWSUser> {
    protected DI: Container;
    protected user: UserType = null;
    protected ignoredUrls: RegExp[] = [];    
    protected regExTypes: { [key: string]: RegExp };  

    public workerScope: ServiceWorkerGlobalScope;

    protected static _instances: { [key: string]: RWSServiceWorker<IRWSUser> } | null = {};

    onInit(): Promise<void> { return; }   

    onInstall(): Promise<void> { return; }
    onActivate(): Promise<void> { return; }

    constructor(workerScope: ServiceWorkerGlobalScope, DI: Container){   
        this.DI = DI;             
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
            RWSServiceWorker._instances[className] = new this(workerScope, RWSContainer());
        }

        return RWSServiceWorker._instances[className] as InstanceType<T>;
    }
}

export default RWSServiceWorker;

export { SWMsgType };