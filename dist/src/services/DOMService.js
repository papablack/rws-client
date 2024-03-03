import RWSService from './_service';
import { DOM } from '@microsoft/fast-element';
import htmlSanitizer from 'sanitize-html';
class DOMServiceInstance extends RWSService {
    parse$(input, directReturn = false) {
        if (input.length > 1 || directReturn) {
            return input;
        }
        if (input.length === 1) {
            return input[0];
        }
        return null;
    }
    $(shadowRoot, selectors, directReturn = false) {
        const elements = shadowRoot.querySelectorAll(selectors);
        return elements ? this.parse$(elements, directReturn) : null;
    }
    async scrollToBottom(scrollContainer, contentSelector = '.scroll-content') {
        if (scrollContainer) {
            const scrollContent = scrollContainer.querySelector(contentSelector);
            if (scrollContent) {
                scrollContainer.scrollTop = (scrollContent.scrollHeight - scrollContainer.clientHeight) + 150;
            }
        }
    }
    setHTMLPolicy(policyName, policyImplementation) {
        const myPolicy = trustedTypes.createPolicy(policyName, {
            createHTML(html) {
                return policyImplementation(html);
            }
        });
        DOM.setHTMLPolicy(myPolicy);
    }
    enforceAllowedTags(htmlText, allowedHTMLTags) {
        // Create a regular expression pattern to match HTML tags
        const tagPattern = /<\s*\/?\s*([^\s>/]+)(\s+[^>]*)?>/g;
        // Replace any tags in the htmlText that are not in allowedHTMLTags array
        const sanitizedText = htmlText.replace(tagPattern, (match, tag, attributes) => {
            const lowerCaseTag = tag.toLowerCase();
            if (allowedHTMLTags.includes(lowerCaseTag)) {
                return match; // Return the original tag if it's allowed
            }
            else {
                // Replace the disallowed tag with an empty string
                return '';
            }
        });
        return sanitizedText;
    }
    sanitizeHTML(line, allowedHTMLTags = null, sanitizeOptions = {}) {
        let output = line.trim();
        if (allowedHTMLTags) {
            sanitizeOptions.allowedTags = allowedHTMLTags;
        }
        return htmlSanitizer(output, sanitizeOptions);
    }
}
export default DOMServiceInstance;
const DOMService = DOMServiceInstance.getSingleton();
export { DOMService };
//# sourceMappingURL=DOMService.js.map