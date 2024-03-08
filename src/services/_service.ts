import { DI, Container, InterfaceSymbol, Registration, Resolver, Key } from "@microsoft/fast-foundation";

export default abstract class TheRWSService {
    _RELOADABLE: boolean = false;

    constructor() {
    }

    protected static _instances: { [key: string]: TheRWSService } | null = {};

    
    public static getSingleton<T extends Key>(this: new () => T): InterfaceSymbol<T>
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

    public reloadService<T extends new (...args: any[]) => TheRWSService>(this: T, ...params: any[]): InstanceType<T> 
    {    
        const className = this.name;
        TheRWSService._instances[className] = new this(...params);        
        return TheRWSService._instances[className] as InstanceType<T>;
    }
}