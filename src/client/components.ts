import RWSWindow, { RWSWindowComponentRegister } from "../interfaces/RWSWindow";
import { RWSClientInstance } from "../client";
import RWSViewComponent, { IWithCompose } from "../components/_component";
type RWSInfoType = { components: string[] };

async function loadPartedComponents(this: RWSClientInstance): Promise<void> {
    this.assignClientToBrowser();

    const componentParts: RWSInfoType = await this.apiService.get<RWSInfoType>(this.appConfig.get('partedDirUrlPrefix') + '/rws_info.json');        

    const componentsPromises: Promise<string>[] = [];

    componentParts.components.forEach((componentName: string, key: number) => {
        const partUrl = `${this.appConfig.get('partedDirUrlPrefix')}/${this.appConfig.get('partedPrefix')}.${componentName}.js`;
        componentsPromises.push(this.apiService.pureGet(partUrl, {
            headers: {
                'Content-Type': 'script'
            } as any
        }));
        console.log(`Appended ${componentParts.components[key]} component (${partUrl})`);

    }); 
    
    const downloadedComponents = await Promise.all(componentsPromises);

    downloadedComponents.forEach((componentCode: string, key: number) => {
        const script: HTMLScriptElement = document.createElement('script');
        script.textContent = componentCode;     
        script.type = 'text/javascript';
        document.body.appendChild(script);
    });     
}   

function defineAllComponents() {
    const richWindowComponents: RWSWindowComponentRegister = (window as Window & RWSWindow).RWS.components;

    Object.keys(richWindowComponents).map(key => richWindowComponents[key].component).forEach((el: IWithCompose<RWSViewComponent>) => {
        el.define(el as any, el.definition);
    });
}

function getBinds(this: RWSClientInstance){
    return {
        loadPartedComponents: loadPartedComponents.bind(this)        
    };
}

export default getBinds;

const ComponentHelperStatic = {
    defineAllComponents: defineAllComponents
}

export {
 ComponentHelperStatic   
}