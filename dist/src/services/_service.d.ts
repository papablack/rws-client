export default abstract class TheService {
    _RELOADABLE: boolean;
    constructor();
    protected static _instances: {
        [key: string]: TheService;
    } | null;
    static getSingleton<T extends new (...args: any[]) => TheService>(this: T): InstanceType<T>;
    getReloadable(): string | null;
    reloadService<T extends new (...args: any[]) => TheService>(this: T, ...params: any[]): InstanceType<T>;
}
