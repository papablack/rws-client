import { loadRWSRichWindow } from "../types/RWSWindow";
import { RWSClientInstance } from "../client";
type RWSInfoType = { components: string[] };

async function loadServices(this: RWSClientInstance){
    const richWindow = loadRWSRichWindow();     

    for (const serviceKey of Object.keys(richWindow.RWS._registered)){
        const currentService = this._container.get(richWindow.RWS._registered[serviceKey]);

        if(currentService.isInClient() && !Object.keys(this.customServices).includes(serviceKey)){                
            this.customServices[serviceKey] = currentService;
        }

        if(currentService.isDefault() && !Object.keys(this.defaultServices).includes(serviceKey)){            
            this.defaultServices[serviceKey] = currentService;                
        }        
    }
}


function getBinds(this: RWSClientInstance){
    return {
        loadServices: loadServices.bind(this),
    };
}

export default getBinds;