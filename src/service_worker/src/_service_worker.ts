import RWSService from '../../services/_service';
import IRWSUser from '../../interfaces/IRWSUser';

type SWMsgType = {
    command: string,
    asset_type?: string,
    params: any
};

declare const workerScope: ServiceWorkerGlobalScope;

abstract class RWSServiceWorker<UserType extends IRWSUser> extends RWSService {
    protected user: UserType = null;
    protected ignoredUrls: RegExp[] = [];
    protected regExTypes: { [key: string]: RegExp }    

    onInit(): Promise<void> { return; }   

    onInstall(): Promise<void> { return; }
    onActivate(): Promise<void> { return; }

    constructor(){
        super();            

        this.onInit().then(() => {
            this.getWorkerScope().addEventListener('install', () => {
                console.log('Service Worker: Installed');
    
                this.onInstall();
            });
    
            this.getWorkerScope().addEventListener('activate', () => {
                console.log('[SW] Service Worker: Activated'); 
                
                this.onActivate();
    
                return this.getWorkerScope().clients.claim();
            });
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

    getUser(): UserType
    {
        return this.user;
    }

    setUser(user: UserType): RWSServiceWorker<UserType>
    {
        this.user = user;        

        return this;
    }

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

export { SWMsgType }