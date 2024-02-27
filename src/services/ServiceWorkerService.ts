import RWSService from 'rws-js-client/src/services/_service';


class ServiceWorkerService extends RWSService {   
    async registerServiceWorker(): Promise<void>
    {
        await ServiceWorkerService.registerServiceWorker();
    }

    static registerServiceWorker(): Promise<void>
    {
        if ('serviceWorker' in navigator) 
        {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                if (registrations.length) {
                  return;
                }

                try {
                    return (navigator.serviceWorker.register(
                        '/service_worker.js',
                        {
                            scope: '/'          
                        }
                    ).then((registration) => {
                        if (registration.installing) {
                            console.log('Service worker installing');
                        } else if (registration.waiting) {
                            console.log('Service worker installed');
                        } else if (registration.active) {
                            console.log('Service worker active');
                        }
                    }));                
                            
                } catch (error) {      
                    console.error(`Registration failed with ${error}`);
                }
            });    
            
            return;
        }
    }

    sendDataToServiceWorker(type: string, data: any)
    {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type,
              data
            });
          } else {
            throw new Error('Service worker is not available');
          }
    }
}


export default ServiceWorkerService.getSingleton();
export { ServiceWorkerService as ServiceWorkerServiceInstance };