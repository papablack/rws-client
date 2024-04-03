import { ViewTemplate } from '@microsoft/fast-element';
import { DOMOutputType } from '../services/DOMService';

type IAssetShowOptions = Record<string, any>;

interface IRWSViewComponent extends Node {    
    __isLoading: boolean;
    routeParams: Record<string, string>;
    trashIterator: number;
    fileAssets: { [key: string]: ViewTemplate };

    connectedCallback(): void;

    passRouteParams(routeParams?: Record<string, string>): void;

    showAsset(assetName: string, options?: IAssetShowOptions): ViewTemplate<any>;

    on<T>(type: string, listener: (event: CustomEvent<T>) => any): void;

    $emitDown<T>(eventName: string, payload: T): void;

    parse$<T extends Element>(input: NodeListOf<T>, directReturn?: boolean): DOMOutputType<T>;

    $<T extends Element>(selectors: string, directReturn?: boolean): DOMOutputType<T>;

    loadingString<T, C>(item: T, addContent: (cnt: C | { output: string }, paste?: boolean, error?: boolean) => void, shouldStop: (stopItem: T, addContent: (cnt: C | { output: string }, paste?: boolean,error?: boolean) => void) => Promise<boolean>): Promise<void>

    onDOMLoad(): Promise<void>;    

    forceReload(): void;

    hotReplacedCallback(): void;    

    sendEventToOutside<T>(eventName: string, data: T): void;           
}

export {IRWSViewComponent, IAssetShowOptions};