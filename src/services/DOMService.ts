import RWSService from './_service';
type DOMOutputType<T extends Element> = NodeListOf<T> | T | null;

class DOMService extends RWSService {
    parse$<T extends Element>(input: NodeListOf<T>, directReturn: boolean = false): DOMOutputType<T> {    
        if(input.length > 1 || directReturn) {
            return input;
        }
    
        if(input.length === 1) {
            return input[0];
        }
    
        return null;
    }

    $<T extends Element>(shadowRoot: ShadowRoot, selectors: string, directReturn: boolean = false): DOMOutputType<T> {        
        const elements = shadowRoot.querySelectorAll<T>(selectors);
        return elements ? this.parse$<T>(elements, directReturn) : null;    
    }

    async scrollToBottom(scrollContainer: HTMLDivElement, contentSelector: string = '.scroll-content') {
        if (scrollContainer) {
            const scrollContent = scrollContainer.querySelector(contentSelector) as HTMLElement;

            if (scrollContent) {
                scrollContainer.scrollTop = (scrollContent.scrollHeight - scrollContainer.clientHeight) + 150;              
            }
        }        
    }
}

export default DOMService.getSingleton();

export { DOMOutputType };