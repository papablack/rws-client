import { FASTElement, ViewTemplate, ElementStyles, observable, html } from '@microsoft/fast-element';
import config from '../services/ConfigService';
import { RWSUtilsService as UtilsService } from '../services/UtilsService';

import { DOMService, DOMOutputType } from '../services/DOMService';

interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}

interface IAssetShowOptions {

}

class RWSViewComponent extends FASTElement {
    private static instances: RWSViewComponent[] = [];
    static fileList: string[] = [];

    public routeParams: Record<string, string> = {};

    static autoLoadFastElement = true;

    @observable trashIterator: number = 0;
    @observable fileAssets: {
        [key: string]: ViewTemplate
      } = {};

    constructor(routeParams: Record<string, string> =  null) {
        super();
        if(routeParams){
            this.routeParams = routeParams;
        }
    }

    connectedCallback() {
        super.connectedCallback();    

        if(!(this.constructor as any).definition && (this.constructor as any).autoLoadFastElement){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }        

        try { 
            const configData = config();

            (this.constructor as any).fileList.forEach((file: string) => { 
                if(this.fileAssets[file]){
                    return;
                }
                UtilsService.getFileContents(configData.get('pubPrefix') + file).then((response: string) => {        
                    this.fileAssets = { ...this.fileAssets, [file]: html`${response}`};        
                }); 
            });      

        }catch(e: Error | any){
            console.error('Error loading file content:', e.message);
            console.error(e.stack);
        }
        
        RWSViewComponent.instances.push(this);
    } 

    private static getInstances(): RWSViewComponent[]
    {
        return RWSViewComponent.instances;
    }

    showAsset(assetName: string, options: IAssetShowOptions = {}): ViewTemplate<any, any>
    {        

        if(!this.fileAssets[assetName]){            
            return html`<span></span>`;
            throw new Error(`File asset "${assetName}" not declared in component "${(this as any).constructor.definition.name}"`);
        }

        return this.fileAssets[assetName];
    }

    static defineComponent()
    {
        const def = (this as any).definition;        

        if(!def){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }

        FASTElement.define(this, def);
    }

    static getDefinition(tagName: string, htmlTemplate: ViewTemplate, styles: ElementStyles = null){                    
        const def: IFastDefinition = {
            name: tagName,
            template: htmlTemplate
        };

        if(styles){
            def.styles = styles;
        }

        return def;
    }

    on<T>(type: string, listener: (event: CustomEvent<T>) => any)
    {
        this.addEventListener(type, (baseEvent: Event) => {
            listener(baseEvent as CustomEvent<T>);
        });
    }

    $emitDown<T>(eventName: string, payload: T){
        this.$emit(eventName, payload, { 
            bubbles: true,
            composed:true
        });
    }

    parse$<T extends Element>(input: NodeListOf<T>, directReturn: boolean = false): DOMOutputType<T> {           
        return DOMService.parse$<T>(input, directReturn);
    }

    $<T extends Element>(selectors: string, directReturn: boolean = false): DOMOutputType<T> {                
        return DOMService.$<T>(this.getShadowRoot(), selectors, directReturn);
    }   

    async loadingString<T, C>(item: T, addContent: (cnt: C | { output: string }, paste?: boolean, error?: boolean) => void, shouldStop: (stopItem: T, addContent: (cnt: C | { output: string }, paste?: boolean,error?: boolean) => void) => Promise<boolean>) {
        let dots = 1;
        const maxDots = 3; // Maximum number of dots
        const interval = setInterval(async () => {
            const dotsString = '. '.repeat(dots);          

            const doesItStop = await shouldStop(item, addContent);                

            if(doesItStop){
                addContent({ output: '' }, true);
                clearInterval(interval);        
            }else{
                addContent({ output: `${dotsString}` }, true);
            
                dots = (dots % (maxDots)) + 1;
            }
        }, 500);
    }

    async onDOMLoad(): Promise<void>
    {
        return new Promise<void>((resolve) => {
            if (this.getShadowRoot() !== null && this.getShadowRoot() !== undefined) {              
                resolve();
            } else {
                // If shadowRoot is not yet available, use MutationObserver to wait for it
                const observer = new MutationObserver(() => {
                    if (this.getShadowRoot() !== null && this.getShadowRoot() !== undefined) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(this, { childList: true, subtree: true });
            }
        });
    }
   

    protected getShadowRoot(): ShadowRoot
    {        
        const shRoot: ShadowRoot | null = this.shadowRoot;

        if(!shRoot){
            throw new Error(`Component ${(this.constructor as any).definition.name} lacks shadow root. If you wish to have component without shadow root extend your class with FASTElement`);
        }

        return shRoot;
    }

    static hotReplacedCallback() {
        this.getInstances().forEach(instance => instance.forceReload());
    }
    
    forceReload() {
        this.trashIterator += 1;
    }

    hotReplacedCallback() {
        this.forceReload();    
    }

    getState<T>(property: string): T
    {
        return (this as any)[property];
    }
}

export default RWSViewComponent;

export { IAssetShowOptions }