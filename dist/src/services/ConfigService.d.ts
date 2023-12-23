import TheService from "./_service";
import IRWSConfig from '../interfaces/IRWSConfig';
declare class ConfigService extends TheService {
    private data;
    constructor(cfg: IRWSConfig);
    get(key: keyof IRWSConfig): any;
    reloadConfig(cfgString: string): Promise<ConfigService>;
    static getConfigSingleton<T extends new (...args: any[]) => TheService>(this: T, cfg?: IRWSConfig): ConfigService;
}
declare const _default: (cfg?: IRWSConfig) => ConfigService;
export default _default;
export { ConfigService };
