import { FASTElement, ViewTemplate, ElementStyles } from '@microsoft/fast-element';
import { DOMOutputType } from '../services/DOMService';
interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}
interface IAssetShowOptions {
}
declare class RWSViewComponent extends FASTElement {
    private static instances;
    static fileList: string[];
    routeParams: Record<string, string>;
    static autoLoadFastElement: boolean;
    trashIterator: number;
    fileAssets: {
        [key: string]: ViewTemplate;
    };
    constructor(routeParams?: Record<string, string>);
    connectedCallback(): void;
    private static getInstances;
    showAsset(assetName: string, options?: IAssetShowOptions): ViewTemplate<any, any>;
    static defineComponent(): void;
    static getDefinition(tagName: string, htmlTemplate: ViewTemplate, styles?: ElementStyles): IFastDefinition;
    on<T>(type: string, listener: (event: CustomEvent<T>) => any): void;
    $emitDown<T>(eventName: string, payload: T): void;
    parse$<T extends Element>(input: NodeListOf<T>, directReturn?: boolean): DOMOutputType<T>;
    $<T extends Element>(selectors: string, directReturn?: boolean): DOMOutputType<T>;
    loadingString<T, C>(item: T, addContent: (cnt: C | {
        output: string;
    }, paste?: boolean, error?: boolean) => void, shouldStop: (stopItem: T, addContent: (cnt: C | {
        output: string;
    }, paste?: boolean, error?: boolean) => void) => Promise<boolean>): Promise<void>;
    onDOMLoad(): Promise<void>;
    protected getShadowRoot(): ShadowRoot;
    static hotReplacedCallback(): void;
    forceReload(): void;
    hotReplacedCallback(): void;
    getState<T>(property: string): T;
}
export default RWSViewComponent;
export { IAssetShowOptions };
