import { DI, Container, InterfaceSymbol, Registration, Resolver, Key } from "@microsoft/fast-foundation";

interface IWithDI<T> {
    [key: string]: any
    new (...args: any[]): T;
    getSingleton: <T extends Key>(this: IWithDI<T>) => InterfaceSymbol<T>;
    register: <T extends Key>(this: IWithDI<T>) => void;
}

export default abstract class TheRWSService {
    _RELOADABLE: boolean = false;

    constructor() {
        console.log('Instanced service:', (this as any).constructor.name);
    }

    register<T extends Key>(this: IWithDI<T>): void 
    {
        this.getSingleton();
    }
    
    getSingleton<T extends Key>(this: IWithDI<T>): InterfaceSymbol<T> 
    {
        return this.getSingleton();
    }

    public static register<T extends Key>(this: IWithDI<T>): void
    {                                        
        this.getSingleton();
    }
    
    public static getSingleton<T extends Key>(this: IWithDI<T>): InterfaceSymbol<T>
    {                  
        // console.trace('Registered service:', (this as any).name)

        return DI.createInterface<T>(x => x.singleton(this));
    }
}