import RWSContainer, { DI, InterfaceSymbol, Key, Registration } from '../components/_container';
import { loadRWSRichWindow } from '../types/RWSWindow';

export interface IWithDI<T> {
    new (...args: any[]): T;
    getSingleton: <T extends Key>(this: IWithDI<T>) => InterfaceSymbol<T>;
    register: <T extends Key>(this: IWithDI<T>) => void;    
}

export default abstract class TheRWSService {
    _RELOADABLE: boolean = false;
    static _IN_CLIENT: boolean = false;
    static _DEFAULT: boolean = false;

    constructor() {    
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
    
    public static getSingleton<T extends Key>(this: IWithDI<T>, serviceName: string = null): InterfaceSymbol<T>
    {                  
        const richWindow = loadRWSRichWindow();        

        if(!serviceName){
            serviceName = this.name;
        }

        if(Object.keys(richWindow.RWS._registered).includes(serviceName)){            
            return richWindow.RWS._registered[serviceName];        
        }

        const interf = DI.createInterface<T>(serviceName);
   
        RWSContainer().register(
            Registration.singleton(interf, this)
        );

        richWindow.RWS._registered[serviceName] = interf;

        return interf;
    }

    isDefault(): boolean
    {
        return (this as any).constructor._DEFAULT;
    }
    
    isInClient(): boolean
    {
        return (this as any).constructor._IN_CLIENT;
    }
}