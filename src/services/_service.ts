import { DI, Container, InterfaceSymbol, Registration, Resolver, Key } from "@microsoft/fast-foundation";

export default abstract class TheRWSService {
    _RELOADABLE: boolean = false;

    constructor() {
    }

    private static factories: Map<typeof TheRWSService, () => TheRWSService> = new Map();
    private static instances: Map<new (...args: any[]) => TheRWSService, TheRWSService> = new Map();
    
    public static getSingleton<T extends Key>(this: new (...args: any[]) => T): InterfaceSymbol<T>
    {
        const singletonInstance = DI.createInterface<T>();      
        const container: Container = DI.getOrCreateDOMContainer();        

        container.register(
            Registration.singleton(this, this)
        );        

        return singletonInstance;
    }

    public getReloadable(): string | null {
        return (this as any).constructor._RELOADABLE || this._RELOADABLE;
    }
}