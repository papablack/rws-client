import RWSService from './_service';
import { DOM } from '@microsoft/fast-element';
import { ILineInfo, tagsProcessor, TagsProcessorType } from '../helpers/tags/TagsProcessorHelper';

type DOMOutputType<T extends Element> = NodeListOf<T> | T | null;

//@ts-expect-error tsconfig.json problem
declare var trustedTypes: TrustedTypePolicyFactory;


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

    sanitizeHTML(line: string, allowedHTMLTags: string[] = [], tagsProcessorElements: TagsProcessorType = null, additionalWork: (preOutput: string) => string)
    {
        let output: string = line.trim();    
        output = this.enforceAllowedTags(output, allowedHTMLTags);
        output = output.replace(/\n\n/g, '\n');

        if(tagsProcessorElements){
            tagsProcessor(output, tagsProcessorElements);
        }

        return output;
    }
}

export default DOMServiceInstance;
const DOMService: DOMServiceInstance = DOMServiceInstance.getSingleton();
export { DOMOutputType, DOMService, ILineInfo, tagsProcessor };