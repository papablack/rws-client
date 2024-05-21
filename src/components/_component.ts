import { ViewTemplate, ElementStyles, observable, html, Constructable, PartialFASTElementDefinition, attr } from '@microsoft/fast-element';
import { FoundationElement, FoundationElementDefinition, FoundationElementRegistry, OverrideFoundationElementDefinition } from '@microsoft/fast-foundation';
import ConfigService, { ConfigServiceInstance } from '../services/ConfigService';
import UtilsService, { UtilsServiceInstance } from '../services/UtilsService';
import DOMService, { DOMServiceInstance, DOMOutputType } from '../services/DOMService';
import ApiService, { ApiServiceInstance } from '../services/ApiService';
import NotifyService, { NotifyServiceInstance } from '../services/NotifyService';
import { IRWSViewComponent, IAssetShowOptions } from '../interfaces/IRWSViewComponent';
import RWSWindow, { RWSWindowComponentInterface, loadRWSRichWindow } from '../interfaces/RWSWindow';
import { applyConstructor, RWSInject } from './_decorator';

import 'reflect-metadata';

interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
} 

type ComposeMethodType<
    T extends FoundationElementDefinition, 
    K extends Constructable<RWSViewComponent>
> = (this: K, elementDefinition: T) => (overrideDefinition?: OverrideFoundationElementDefinition<T>) => FoundationElementRegistry<FoundationElementDefinition, T>;

export interface IWithCompose<T extends RWSViewComponent> {
    [key: string]: any
    new (...args: any[]): T;
    definition?: IFastDefinition
    defineComponent: <T extends RWSViewComponent>(this: IWithCompose<T>) => void
    isDefined<T extends RWSViewComponent>(this: IWithCompose<T>): boolean
    compose: ComposeMethodType<FoundationElementDefinition, Constructable<T>>;
    define<TType extends (...params: any[]) => any>(type: TType, nameOrDef?: string | PartialFASTElementDefinition | undefined): TType;
    _verbose: boolean;
    _toInject: {[key: string]: any};
    _depKeys: {[key: string]: string[]};
}

abstract class RWSViewComponent extends FoundationElement implements IRWSViewComponent {
    __isLoading: boolean = true;
    private static instances: RWSViewComponent[] = [];
    static fileList: string[] = [];

    @attr routeParams: Record<string, string> = {};

    static autoLoadFastElement = true;
    static _defined: { [key: string]: boolean } = {};
    static _toInject: any[] = [];
    static _depKeys: {[key: string]: string[]} = {_all: []};
    static _verbose: boolean = false;

    @RWSInject(ConfigService, true) protected config: ConfigServiceInstance;    
    @RWSInject(DOMService, true) protected domService: DOMServiceInstance;
    @RWSInject(UtilsService, true) protected utilsService: UtilsServiceInstance;
    @RWSInject(ApiService, true) protected apiService: ApiServiceInstance;    
    @RWSInject(NotifyService, true) protected notifyService: NotifyServiceInstance;

    @observable trashIterator: number = 0;
    @observable fileAssets: {
        [key: string]: ViewTemplate
    } = {};    

    constructor() {
        super();       
        applyConstructor(this);
        
    }

    connectedCallback() {        
        super.connectedCallback();        
        applyConstructor(this);
     
        // console.trace(this.config);
        // console.log(this.routingService);
        if (!(this.constructor as IWithCompose<this>).definition && (this.constructor as IWithCompose<this>).autoLoadFastElement) {
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }

        try {
            (this.constructor as IWithCompose<this>).fileList.forEach((file: string) => {
                if (this.fileAssets[file]) {
                    return;
                }
                this.apiService.pureGet(this.config.get('pubUrlFilePrefix') + file).then((response: string) => {
                    this.fileAssets = { ...this.fileAssets, [file]: html`${response}` };
                });
            });

        } catch (e: Error | any) {
            console.error('Error loading file content:', e.message);
            console.error(e.stack);
        }

        RWSViewComponent.instances.push(this);
    }

    observe(callback: (component: this, node: Node, observer: MutationObserver) => Promise<void>, condition: (component: this, node: Node) => boolean = null, observeRemoved: boolean = false)
    {
        const observer = new MutationObserver((mutationsList, observer) => {
            for(const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const mutationObserveType: NodeList = observeRemoved ? mutation.removedNodes : mutation.addedNodes;
                    mutationObserveType.forEach(node => {                    
                        if ((condition !== null && condition(this, node))) {
                            callback(this, node, observer);
                        }else if(condition === null){
                            callback(this, node, observer);
                        }                    
                    });
                }
            }
        });
        
        observer.observe(this.getShadowRoot(), { childList: true, subtree: true });
    }

    passRouteParams(routeParams: Record<string, string> = null) {
        if (routeParams) {
            this.routeParams = routeParams;
        }
    }

    showAsset(assetName: string, options: IAssetShowOptions = {}): ViewTemplate<any, any> {

        if (!this.fileAssets[assetName]) {
            return html`<span></span>`;
            throw new Error(`File asset "${assetName}" not declared in component "${(this.constructor as IWithCompose<this>).definition.name}"`);
        }

        return this.fileAssets[assetName];
    }

    on<T>(type: string, listener: (event: CustomEvent<T>) => any) {
        this.addEventListener(type, (baseEvent: Event) => {
            listener(baseEvent as CustomEvent<T>);
        });
    }

    $emitDown<T>(eventName: string, payload: T) {
        this.$emit(eventName, payload, {
            bubbles: true,
            composed: true
        });
    }

    parse$<T extends Element>(input: NodeListOf<T>, directReturn: boolean = false): DOMOutputType<T> {
        return this.domService.parse$<T>(input, directReturn);
    }

    $<T extends Element>(selectors: string, directReturn: boolean = false): DOMOutputType<T> {
        return this.domService.$<T>(this.getShadowRoot(), selectors, directReturn);
    }

    async loadingString<T, C>(item: T, addContent: (cnt: C | { output: string }, paste?: boolean, error?: boolean) => void, shouldStop: (stopItem: T, addContent: (cnt: C | { output: string }, paste?: boolean, error?: boolean) => void) => Promise<boolean>) {
        let dots = 1;
        const maxDots = 3; // Maximum number of dots
        const interval = setInterval(async () => {
            const dotsString = '. '.repeat(dots);

            const doesItStop = await shouldStop(item, addContent);

            if (doesItStop) {
                addContent({ output: '' }, true);
                clearInterval(interval);
            } else {
                addContent({ output: `${dotsString}` }, true);

                dots = (dots % (maxDots)) + 1;
            }
        }, 500);
    }

    async onDOMLoad(): Promise<void> {
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


    protected getShadowRoot(): ShadowRoot {
        const shRoot: ShadowRoot | null = this.shadowRoot;

        if (!shRoot) {
            throw new Error(`Component ${(this.constructor as IWithCompose<this>).definition.name} lacks shadow root. If you wish to have component without shadow root extend your class with FASTElement`);
        }

        return shRoot;
    }

    forceReload() {
        this.trashIterator += 1;
    }

    hotReplacedCallback() {
        this.forceReload();
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

    static isDefined<T extends RWSViewComponent>(this: IWithCompose<T>): boolean 
    {
        const richWindow: RWSWindow = loadRWSRichWindow();

        if(!this.definition){
            return false;
        }

        return Object.keys(richWindow.RWS.components).includes(this.definition.name);
    }

    static defineComponent<T extends RWSViewComponent>(this: IWithCompose<T>): void
    {
        if(this.isDefined()){
            if(this._verbose){
                console.warn(`Component ${this.name} is already declared`);
            }            
            
            return;
        }

        const richWindow = loadRWSRichWindow();        

        if (!this.definition) {
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }

        const composedComp = this.compose({
            baseName: this.definition.name,
            template: this.definition.template,
            styles: this.definition.styles
        }) as RWSWindowComponentInterface;

        if (!richWindow.RWS) {
            throw new Error('RWS client not initialized');
        }

        richWindow.RWS.components[this.definition.name] = {
            interface: composedComp,
            component: this
        };        
    }

    static getDefinition(tagName: string, htmlTemplate: ViewTemplate, styles: ElementStyles = null) {
        const def: IFastDefinition = {
            name: tagName,
            template: htmlTemplate
        };

        if (styles) {
            def.styles = styles;
        }

        return def;
    }

    private static getInstances(): RWSViewComponent[] {
        return RWSViewComponent.instances;
    }
}

export default RWSViewComponent;

export { IAssetShowOptions, IRWSViewComponent };