import IRWSUser from '../../interfaces/IRWSUser';
type SWMsgType = {
    command: string;
    asset_type?: string;
    params: any;
};
declare abstract class RWSServiceWorker<UserType extends IRWSUser> {
    protected user: UserType;
    protected ignoredUrls: RegExp[];
    protected regExTypes: {
        [key: string]: RegExp;
    };
    workerScope: ServiceWorkerGlobalScope;
    protected static _instances: {
        [key: string]: RWSServiceWorker<IRWSUser>;
    } | null;
    onInit(): Promise<void>;
    onInstall(): Promise<void>;
    onActivate(): Promise<void>;
    constructor(workerScope: ServiceWorkerGlobalScope);
    sendMessageToClient: (clientId: string, payload: any) => Promise<void>;
    getUser(): UserType;
    setUser(user: UserType): RWSServiceWorker<UserType>;
    static create<T extends new (...args: any[]) => RWSServiceWorker<IRWSUser>>(this: T, workerScope: ServiceWorkerGlobalScope): InstanceType<T>;
}
export default RWSServiceWorker;
export { SWMsgType };
