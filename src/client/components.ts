import RWSWindow, { RWSWindowComponentRegister } from "../types/RWSWindow";
import { RWSClientInstance } from "../client";
import RWSViewComponent, { IWithCompose } from "../components/_component";
import { RWSPlugin } from "../plugins/_plugin";
type RWSInfoType = { components: string[] };

async function loadPartedComponents(this: RWSClientInstance): Promise<RWSInfoType> {
    this.assignClientToBrowser();

    const componentParts: RWSInfoType = await this.apiService.get<RWSInfoType>(this.appConfig.get('partedDirUrlPrefix') + '/rws_info.json');        

    const componentsPromises: Promise<string>[] = [];

    let compList = '';
    
    componentParts.components.forEach((componentName: string, key: number) => {
        const partUrl = `${this.appConfig.get('partedDirUrlPrefix')}/${this.appConfig.get('partedPrefix')}.${componentName}.js`;
        componentsPromises.push(this.apiService.pureGet(partUrl, {
            headers: {
                'Content-Type': 'script'
            } as any
        }));        

        compList += `  - \x1b[1m${componentParts.components[key]}:\x1b[0m component (${partUrl}) \n`;
    }); 

    console.info(`\x1b[1m[RWS]\x1b[0m" \x1b[1mPARTED\x1b[0m" mode asynchronously added components: \n${compList}`);
    
    const downloadedComponents = await Promise.all(componentsPromises);

    downloadedComponents.forEach((componentCode: string, key: number) => {
        const script: HTMLScriptElement = document.createElement('script');
        script.textContent = componentCode;     
        script.type = 'text/javascript';
        document.body.appendChild(script);
    });     

    return componentParts;
}   

function defineAllComponents() {
    const richWindowComponents: RWSWindowComponentRegister = (window as Window & RWSWindow).RWS.components;

    Object.keys(richWindowComponents).map(key => richWindowComponents[key].component).forEach((el: IWithCompose<RWSViewComponent>) => {
        el.define(el as any, el.definition);
    });

    for (const plugin of RWSPlugin.getAllPlugins()){
        plugin.onComponentsDeclare();
    }
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
 ComponentHelperStatic,
 RWSInfoType
}