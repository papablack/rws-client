import RWSService from './_service';
class DOMService extends RWSService {
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
}
export default DOMService.getSingleton();
//# sourceMappingURL=DOMService.js.map