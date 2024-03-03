var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { FASTElement, observable, html } from '@microsoft/fast-element';
import config from '../services/ConfigService';
import { RWSUtilsService as UtilsService } from '../services/UtilsService';
import { DOMService } from '../services/DOMService';
class RWSViewComponent extends FASTElement {
    constructor(routeParams = null) {
        super();
        this.routeParams = {};
        this.trashIterator = 0;
        this.fileAssets = {};
        if (routeParams) {
            this.routeParams = routeParams;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.constructor.definition && this.constructor.autoLoadFastElement) {
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }
        try {
            const configData = config();
            this.constructor.fileList.forEach((file) => {
                if (this.fileAssets[file]) {
                    return;
                }
                UtilsService.getFileContents(configData.get('pubPrefix') + file).then((response) => {
                    this.fileAssets = { ...this.fileAssets, [file]: html `${response}` };
                });
            });
        }
        catch (e) {
            console.error('Error loading file content:', e.message);
            console.error(e.stack);
        }
        RWSViewComponent.instances.push(this);
    }
    static getInstances() {
        return RWSViewComponent.instances;
    }
    showAsset(assetName, options = {}) {
        if (!this.fileAssets[assetName]) {
            return html `<span></span>`;
            throw new Error(`File asset "${assetName}" not declared in component "${this.constructor.definition.name}"`);
        }
        return this.fileAssets[assetName];
    }
    static defineComponent() {
        const def = this.definition;
        if (!def) {
            throw new Error('RWS component is not named. Add `static definition = {name, template};`');
        }
        FASTElement.define(this, def);
    }
    static getDefinition(tagName, htmlTemplate, styles = null) {
        const def = {
            name: tagName,
            template: htmlTemplate
        };
        if (styles) {
            def.styles = styles;
        }
        return def;
    }
    on(type, listener) {
        this.addEventListener(type, (baseEvent) => {
            listener(baseEvent);
        });
    }
    $emitDown(eventName, payload) {
        this.$emit(eventName, payload, {
            bubbles: true,
            composed: true
        });
    }
    parse$(input, directReturn = false) {
        return DOMService.parse$(input, directReturn);
    }
    $(selectors, directReturn = false) {
        return DOMService.$(this.getShadowRoot(), selectors, directReturn);
    }
    async loadingString(item, addContent, shouldStop) {
        let dots = 1;
        const maxDots = 3; // Maximum number of dots
        const interval = setInterval(async () => {
            const dotsString = '. '.repeat(dots);
            const doesItStop = await shouldStop(item, addContent);
            if (doesItStop) {
                addContent({ output: '' }, true);
                clearInterval(interval);
            }
            else {
                addContent({ output: `${dotsString}` }, true);
                dots = (dots % (maxDots)) + 1;
            }
        }, 500);
    }
    async onDOMLoad() {
        return new Promise((resolve) => {
            if (this.getShadowRoot() !== null && this.getShadowRoot() !== undefined) {
                resolve();
            }
            else {
                // If shadowRoot is not yet available, use MutationObserver to wait for it
                const observer = new MutationObserver(() => {
                    if (this.getShadowRoot() !== null && this.getShadowRoot() !== undefined) {
                        observer.disconnect();
                        resolve();
                    }
                });
                observer.observe(this, { childList: true, subtree: true });
            }
        });
    }
    getShadowRoot() {
        const shRoot = this.shadowRoot;
        if (!shRoot) {
            throw new Error(`Component ${this.constructor.definition.name} lacks shadow root. If you wish to have component without shadow root extend your class with FASTElement`);
        }
        return shRoot;
    }
    static hotReplacedCallback() {
        this.getInstances().forEach(instance => instance.forceReload());
    }
    forceReload() {
        this.trashIterator += 1;
    }
    hotReplacedCallback() {
        this.forceReload();
    }
    getState(property) {
        return this[property];
    }
}
RWSViewComponent.instances = [];
RWSViewComponent.fileList = [];
RWSViewComponent.autoLoadFastElement = true;
__decorate([
    observable,
    __metadata("design:type", Number)
], RWSViewComponent.prototype, "trashIterator", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], RWSViewComponent.prototype, "fileAssets", void 0);
export default RWSViewComponent;
//# sourceMappingURL=_component.js.map