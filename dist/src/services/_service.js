class TheService {
    constructor() {
        this._RELOADABLE = false;
    }
    static getSingleton() {
        const className = this.name;
        if (!TheService._instances[className]) {
            TheService._instances[className] = new this();
        }
        return TheService._instances[className];
    }
    getReloadable() {
        return this.constructor._RELOADABLE || this._RELOADABLE;
    }
    reloadService(...params) {
        const className = this.name;
        TheService._instances[className] = new this(...params);
        return TheService._instances[className];
    }
}
TheService._instances = {};
export default TheService;
//# sourceMappingURL=_service.js.map