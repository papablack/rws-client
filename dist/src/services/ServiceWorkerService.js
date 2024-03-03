import RWSService from 'rws-js-client/src/services/_service';
class ServiceWorkerService extends RWSService {
    async registerServiceWorker() {
        await ServiceWorkerService.registerServiceWorker();
    }
    static registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                if (registrations.length) {
                    return;
                }
                try {
                    return (navigator.serviceWorker.register('/service_worker.js', {
                        scope: '/'
                    }).then((registration) => {
                        if (registration.installing) {
                            console.log('Service worker installing');
                        }
                        else if (registration.waiting) {
                            console.log('Service worker installed');
                        }
                        else if (registration.active) {
                            console.log('Service worker active');
                        }
                    }));
                }
                catch (error) {
                    console.error(`Registration failed with ${error}`);
                }
            });
            return;
        }
    }
    sendDataToServiceWorker(type, data, asset_type = 'data_push') {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                command: type,
                asset_type,
                params: data
            });
        }
        else {
            throw new Error('Service worker is not available');
        }
    }
}
export default ServiceWorkerService.getSingleton();
export { ServiceWorkerService as ServiceWorkerServiceInstance };
//# sourceMappingURL=ServiceWorkerService.js.map