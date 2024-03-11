import { DI, Container, InterfaceSymbol, Registration, Resolver, Key } from "@microsoft/fast-foundation";


export default abstract class TheRWSService {
    _RELOADABLE: boolean = false;

    constructor() {
    }

    
    public static getSingleton<T extends Key>(this: new (...args: any[]) => T): InterfaceSymbol<T>
    {
            
        const container: Container = DI.getOrCreateDOMContainer();              

        const singletonInstance = DI.createInterface<T>(x => x.singleton(this));  

        // container.register(singletonInstance);

        console.log(container.get<T>(this));

        return singletonInstance;
    }
}