import { DI, InterfaceSymbol, Key, Registration, FoundationElementDefinition } from "@microsoft/fast-foundation";
import RWSContainer from "../components/_container";
import RWSWindow, { loadRWSRichWindow, RWSWindowComponentInterface } from "../interfaces/RWSWindow";

export interface IWithDI<T> {
    new (...args: any[]): T;
    getSingleton: <T extends Key>(this: IWithDI<T>) => InterfaceSymbol<T>;
    register: <T extends Key>(this: IWithDI<T>) => void;    
}

export default abstract class TheRWSService {
    _RELOADABLE: boolean = false;

    constructor() {
        // console.log('Instanced service:', (this as any).constructor.name);
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
        const richWindow = loadRWSRichWindow();        

        if(Object.keys(richWindow.RWS._registered).includes(this.name)){            
            return richWindow.RWS._registered[this.name];        
        }

        const interf = DI.createInterface<T>(this.name);
   
        RWSContainer().register(
            Registration.singleton(interf, this)
        );

        richWindow.RWS._registered[this.name] = interf;

        return interf;
    }
}