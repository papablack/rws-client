export default abstract class TheService{
    _RELOADABLE: boolean = false;

    constructor() {
    }

    protected static _instances: { [key: string]: TheService } | null = {};

    public static getSingleton<T extends new (...args: any[]) => TheService>(this: T): InstanceType<T> {
        const className = this.name;

        if (!TheService._instances[className]) {
            TheService._instances[className] = new this();
        }

        return TheService._instances[className] as InstanceType<T>;
    }

    public getReloadable(): string | null {
        return (this as any).constructor._RELOADABLE || this._RELOADABLE;
    }

    public reloadService<T extends new (...args: any[]) => TheService>(this: T, ...params: any[]): InstanceType<T> {    
        const className = this.name;
        TheService._instances[className] = new this(...params);        
        return TheService._instances[className] as InstanceType<T>;
    }
}