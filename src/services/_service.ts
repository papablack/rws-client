export default abstract class TheRWSService{
    _RELOADABLE: boolean = false;

    constructor() {
    }

    protected static _instances: { [key: string]: TheRWSService } | null = {};

    public static getSingleton<T extends new (...args: any[]) => TheRWSService>(this: T): InstanceType<T> {
        const className = this.name;

        if (!TheRWSService._instances[className]) {
            TheRWSService._instances[className] = new this();
        }

        return TheRWSService._instances[className] as InstanceType<T>;
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