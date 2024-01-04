import TheService from "./_service";
class ConfigService extends TheService {
    constructor(cfg) {
        super();
        this.data = cfg;
    }
    get(key) {
        return this.data[key];
    }
    async reloadConfig(cfgString) {
        const module = await import(/* webpackIgnore: true */ cfgString);
        const cfg = module.defaults;
        this.data = cfg();
        return this;
    }
    static getConfigSingleton(cfg) {
        const className = this.name;
        const instanceExists = TheService._instances[className];
        console.log(cfg);
        if (cfg) {
            TheService._instances[className] = new this(cfg);
        }
        else if (!instanceExists && !cfg) {
            console.log(window);
            const globalCFG = window.RWSClient.config;
            if (!globalCFG) {
                throw new Error('no-cfg');
            }
            else {
                TheService._instances[className] = new this(globalCFG);
            }
        }
        return TheService._instances[className];
    }
}
export default (cfg) => ConfigService.getConfigSingleton(cfg);
export { ConfigService };
//# sourceMappingURL=ConfigService.js.map