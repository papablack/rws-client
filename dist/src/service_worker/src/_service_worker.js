class RWSServiceWorker {
    onInit() { return; }
    onInstall() { return; }
    onActivate() { return; }
    constructor(workerScope) {
        this.user = null;
        this.ignoredUrls = [];
        this.sendMessageToClient = (clientId, payload) => {
            return this.workerScope.clients.get(clientId)
                .then((client) => {
                if (client) {
                    client.postMessage(payload);
                }
            });
        };
        this.workerScope = workerScope;
        this.onInit().then(() => {
            this.workerScope.addEventListener('install', () => {
                console.log('Service Worker: Installed');
                this.onInstall();
            });
            this.workerScope.addEventListener('activate', () => {
                console.log('[SW] Service Worker: Activated');
                this.onActivate();
                return workerScope.clients.claim();
            });
        });
    }
    getUser() {
        return this.user;
    }
    setUser(user) {
        this.user = user;
        return this;
    }
    static create(workerScope) {
        const className = this.name;
        if (!RWSServiceWorker._instances[className]) {
            RWSServiceWorker._instances[className] = new this(workerScope);
        }
        return RWSServiceWorker._instances[className];
    }
}
RWSServiceWorker._instances = {};
export default RWSServiceWorker;
//# sourceMappingURL=_service_worker.js.map