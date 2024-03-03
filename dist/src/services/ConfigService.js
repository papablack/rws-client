import TheService from './_service';
const _DEFAULTS = {
    'pubPrefix': '/',
    'pubUrl': window.origin,
};
class ConfigService extends TheService {
    constructor(cfg) {
        super();
        this.data = cfg;
    }
    get(key) {
        const isInData = Object.keys(this.data).includes(key);
        const isInDefaults = Object.keys(_DEFAULTS).includes(key);
        if (!isInData && isInDefaults) {
            let defaultVal = _DEFAULTS[key];
            if (defaultVal[0] === '@') {
                defaultVal = this.data[(defaultVal.slice(1))];
            }
            return defaultVal;
        }
        else if (!isInData && !isInDefaults) {
            return null;
        }
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
        if (cfg) {
            TheService._instances[className] = new this(cfg);
        }
        else if (!instanceExists && !cfg) {
            // return new this({}) as ConfigService; // DO NOT USE OR I'LL CUT U!!!!!!
            throw new Error('[RWS] No frontend configuration passed to RWSClient');
        }
        return TheService._instances[className];
    }
    getData() {
        return this.data;
    }
}
export default (cfg) => ConfigService.getConfigSingleton(cfg);
export { ConfigService as ConfigServiceInstance };
//# sourceMappingURL=ConfigService.js.map