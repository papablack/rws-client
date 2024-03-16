import RWSService from './_service';
import { DOM } from '@microsoft/fast-element';
import htmlSanitizer, { Transformer, IOptions } from 'sanitize-html';

type TagsProcessorType = { [tagName: string]: string | Transformer };
type DOMOutputType<T extends Element> = NodeListOf<T> | T | null;

//@ts-expect-error tsconfig.json problem
declare let trustedTypes: TrustedTypePolicyFactory;


class DOMServiceInstance extends RWSService {
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

    setHTMLPolicy(policyName: string, policyImplementation: (html: string) => string): void
    {
        const myPolicy = trustedTypes.createPolicy(policyName, {
            createHTML(html: string) {              
                return policyImplementation(html);
            }
        });
          
        DOM.setHTMLPolicy(myPolicy);        
    }

    private enforceAllowedTags(htmlText: string, allowedHTMLTags: string[]): string
    {
        // Create a regular expression pattern to match HTML tags
        const tagPattern = /<\s*\/?\s*([^\s>/]+)(\s+[^>]*)?>/g;

        // Replace any tags in the htmlText that are not in allowedHTMLTags array
        const sanitizedText = htmlText.replace(tagPattern, (match, tag, attributes) => {
            const lowerCaseTag = tag.toLowerCase();

            if (allowedHTMLTags.includes(lowerCaseTag)) {
                return match; // Return the original tag if it's allowed
            } else {
                // Replace the disallowed tag with an empty string
                return '';
            }
        });

        return sanitizedText;
    }

    sanitizeHTML(
        line: string, 
        allowedHTMLTags: string[] = null,         
        sanitizeOptions: IOptions = {})
    {
        const output: string = line.trim(); 
        
        if(allowedHTMLTags){
            sanitizeOptions.allowedTags = allowedHTMLTags;
        }     

        const sanitized = htmlSanitizer(output, sanitizeOptions);

        return sanitized;
    }
}

const DOMService = DOMServiceInstance.getSingleton();

export default DOMService;
export { DOMOutputType, DOMServiceInstance, TagsProcessorType }; 