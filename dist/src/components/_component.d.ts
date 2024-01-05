import { FASTElement, ViewTemplate, ElementStyles } from "@microsoft/fast-element";
import { DOMOutputType } from '../services/DOMService';
interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}
declare class RWSViewComponent extends FASTElement {
    private static instances;
    routeParams: Record<string, string>;
    static autoLoadFastElement: boolean;
    trashIterator: number;
    constructor(routeParams?: Record<string, string>);
    connectedCallback(): void;
    private static getInstances;
    static defineComponent(): void;
    static getDefinition(tagName: string, htmlTemplate: ViewTemplate, styles?: ElementStyles): IFastDefinition;
    on<T>(type: string, listener: (event: CustomEvent<T>) => any): void;
    $emitDown<T>(eventName: string, payload: T): void;
    parse$<T extends Element>(input: NodeListOf<T>, directReturn?: boolean): DOMOutputType<T>;
    $<T extends Element>(selectors: string, directReturn?: boolean): DOMOutputType<T>;
    loadingString<T>(item: T, addContent: (cnt: string) => void, shouldStop: (stopItem: T, addContent: (cnt: string) => void) => Promise<boolean>): Promise<void>;
    onDOMLoad(): Promise<void>;
    protected getShadowRoot(): ShadowRoot;
    static hotReplacedCallback(): void;
    forceReload(): void;
    hotReplacedCallback(): void;
}
export default RWSViewComponent;
