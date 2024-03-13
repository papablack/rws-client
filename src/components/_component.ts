import { ViewTemplate, ElementStyles, observable, html } from '@microsoft/fast-element';
import { FoundationElement, FoundationElementDefinition, FoundationElementRegistry } from '@microsoft/fast-foundation';
import ConfigService, { ConfigServiceInstance } from '../services/ConfigService';
import UtilsService, { UtilsServiceInstance } from '../services/UtilsService';
import  DOMService, { DOMServiceInstance, DOMOutputType } from '../services/DOMService';
import ApiService, { ApiServiceInstance } from '../services/ApiService';
import NotifyService, { NotifyServiceInstance } from '../services/NotifyService';
import RoutingService, { RoutingServiceInstance } from '../services/RoutingService';
import WSService, { WSServiceInstance } from '../services/WSService';
import { IRWSViewComponent, IAssetShowOptions } from '../interfaces/IRWSViewComponent';
import { DI, inject } from '@microsoft/fast-foundation';
import { provideRWSDesignSystem } from './_design_system';
import RWSWindow, { RWSWindowComponentEntry,RWSWindowComponentInterface } from '../interfaces/RWSWindow';

interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}

abstract class RWSViewComponent extends FoundationElement implements IRWSViewComponent {
    __isLoading: boolean = true;
    private static instances: RWSViewComponent[] = [];
    static fileList: string[] = [];

    public routeParams: Record<string, string> = {};

    static autoLoadFastElement = true;
    static _defined: {[key: string]: boolean} = {};

    @observable trashIterator: number = 0;
    @observable fileAssets: {
        [key: string]: ViewTemplate
      } = {};

    constructor(
        @ConfigService protected config: ConfigServiceInstance,
        @RoutingService protected routingService: RoutingServiceInstance,        
        @DOMService protected domService: DOMServiceInstance,
        @UtilsService protected utilsService: UtilsServiceInstance,        
        @ApiService protected apiService: ApiServiceInstance,
        @WSService protected wsService: WSServiceInstance,
        @NotifyService protected notifyService: NotifyServiceInstance
    ) {
        super();    

        // DI.getDependencies((this as any).constructor).forEach((el: any, key: any) => {
        //     // console.log(DI.getOrCreateDOMContainer().get(el));
        // });
    }

    connectedCallback() {
        super.connectedCallback();    
        
        

        // console.trace(this.config);

        if(!(this.constructor as any).definition && (this.constructor as any).autoLoadFastElement){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }                     

        try {             
            (this.constructor as any).fileList.forEach((file: string) => { 
                if(this.fileAssets[file]){
                    return;
                }
                this.utilsService.getFileContents(this.config.get('pubPrefix') + file).then((response: string) => {        
                    this.fileAssets = { ...this.fileAssets, [file]: html`${response}`};        
                }); 
            });      

        }catch(e: Error | any){
            console.error('Error loading file content:', e.message);
            console.error(e.stack);
        }
        
        RWSViewComponent.instances.push(this);
    } 

    passRouteParams(routeParams: Record<string, string> =  null)
    {
        if(routeParams){
            this.routeParams = routeParams;
        }     
    }    

    showAsset(assetName: string, options: IAssetShowOptions = {}): ViewTemplate<any, any>
    {        

        if(!this.fileAssets[assetName]){            
            return html`<span></span>`;
            throw new Error(`File asset "${assetName}" not declared in component "${(this as any).constructor.definition.name}"`);
        }

        return this.fileAssets[assetName];
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
        return this.domService.parse$<T>(input, directReturn);
    }

    $<T extends Element>(selectors: string, directReturn: boolean = false): DOMOutputType<T> {                
        return this.domService.$<T>(this.getShadowRoot(), selectors, directReturn);
    }   

    async loadingString<T, C>(item: T, addContent: (cnt: C | { output: string }, paste?: boolean, error?: boolean) => void, shouldStop: (stopItem: T, addContent: (cnt: C | { output: string }, paste?: boolean,error?: boolean) => void) => Promise<boolean>) 
    {
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

    sendEventToOutside<T>(eventName: string, data: T) {
        const event = new CustomEvent<T>(eventName, {
          detail: data,
          bubbles: true, 
          composed: true
        });

        this.$emit(eventName, event);
    }
    
    
    static hotReplacedCallback() {
        this.getInstances().forEach(instance => instance.forceReload());
    }    

    static isDefined: (key: string) => boolean = (key) => {
        return !!RWSViewComponent._defined[key];
    }

    static defineComponent()
    {
        const def = (this as any).definition;  

        if(!def){
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }

        const composedComp: RWSWindowComponentInterface = (this as any).compose({
            baseName: def.name,
            template: def.template,
            styles: def.styles
        }) as RWSWindowComponentInterface;        

        if(!(window as Window & RWSWindow).RWS){
            throw new Error('RWS client not initialized');
        }        

        (window as Window & RWSWindow).RWS.components[def.name] = {
            interface: composedComp,
            component: this
        };
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

    private static getInstances(): RWSViewComponent[]
    {
        return RWSViewComponent.instances;
    }
}

export default RWSViewComponent;

export { IAssetShowOptions, IRWSViewComponent }