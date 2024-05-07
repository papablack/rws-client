import RWSWindow, { RWSWindowComponentRegister } from "../interfaces/RWSWindow";
import { RWSClientInstance } from "../client";
import RWSViewComponent, { IWithCompose } from "../components/_component";
type RWSInfoType = { components: string[] };

async function loadPartedComponents(this: RWSClientInstance): Promise<void> {
    this.assignClientToBrowser();

    const componentParts: RWSInfoType = await this.apiService.get<RWSInfoType>(this.appConfig.get('partedDirUrlPrefix') + '/rws_info.json');        

    componentParts.components.forEach((componentName: string, key: number) => {
        const partUrl = `${this.appConfig.get('partedDirUrlPrefix')}/${this.appConfig.get('partedPrefix')}.${componentName}.js`;

        const script: HTMLScriptElement = document.createElement('script');
        script.src = partUrl;
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);

        console.log(`Appended ${componentParts.components[key]} component (${partUrl})`);
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