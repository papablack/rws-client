import RWSService from './_service';
type DOMOutputType<T extends Element> = NodeListOf<T> | T | null;
declare class DOMService extends RWSService {
    parse$<T extends Element>(input: NodeListOf<T>, directReturn?: boolean): DOMOutputType<T>;
    $<T extends Element>(shadowRoot: ShadowRoot, selectors: string, directReturn?: boolean): DOMOutputType<T>;
    scrollToBottom(scrollContainer: HTMLDivElement, contentSelector?: string): Promise<void>;
}
declare const _default: DOMService;
export default _default;
export { DOMOutputType };
