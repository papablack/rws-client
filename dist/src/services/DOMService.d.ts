import RWSService from './_service';
import { Transformer, IOptions } from 'sanitize-html';
type TagsProcessorType = {
    [tagName: string]: string | Transformer;
};
type DOMOutputType<T extends Element> = NodeListOf<T> | T | null;
declare class DOMServiceInstance extends RWSService {
    parse$<T extends Element>(input: NodeListOf<T>, directReturn?: boolean): DOMOutputType<T>;
    $<T extends Element>(shadowRoot: ShadowRoot, selectors: string, directReturn?: boolean): DOMOutputType<T>;
    scrollToBottom(scrollContainer: HTMLDivElement, contentSelector?: string): Promise<void>;
    setHTMLPolicy(policyName: string, policyImplementation: (html: string) => string): void;
    private enforceAllowedTags;
    sanitizeHTML(line: string, allowedHTMLTags?: string[], sanitizeOptions?: IOptions): string;
}
export default DOMServiceInstance;
declare const DOMService: DOMServiceInstance;
export { DOMOutputType, DOMService, TagsProcessorType };
