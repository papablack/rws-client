var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { RWSView, RWSViewComponent, observable, attr } from '../../index';
let RWSUploader = class RWSUploader extends RWSViewComponent {
    constructor() {
        super(...arguments);
        this.uploadProgress = 0;
        this.onStart = (chosenFile) => null;
        this.onProgress = (progress) => null;
    }
    async onUploadStart() {
        const response = await this.onStart(this.chosenFile, this);
        this.onFinish(response);
        this.uploadedFile = this.chosenFile;
        this.chosenFile = null;
    }
    onChoose() {
        const _self = this;
        const fileInput = this.createFileInput();
        this.triggerUpload(fileInput);
        fileInput.addEventListener('change', () => {
            _self.chosenFile = fileInput.files[0];
            _self.uploadedFile = null;
            _self.removeFileInput(fileInput);
        });
    }
    removeFile() {
        this.chosenFile = null;
    }
    createFileInput() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        this.shadowRoot.appendChild(fileInput);
        return fileInput;
    }
    triggerUpload(fileInput) {
        fileInput.click();
    }
    removeFileInput(fileInput) {
        this.shadowRoot.removeChild(fileInput);
    }
};
__decorate([
    observable,
    __metadata("design:type", Number)
], RWSUploader.prototype, "uploadProgress", void 0);
__decorate([
    observable,
    __metadata("design:type", File)
], RWSUploader.prototype, "uploadedFile", void 0);
__decorate([
    observable,
    __metadata("design:type", File)
], RWSUploader.prototype, "chosenFile", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], RWSUploader.prototype, "uploadParams", void 0);
__decorate([
    attr,
    __metadata("design:type", Function)
], RWSUploader.prototype, "onFinish", void 0);
__decorate([
    attr,
    __metadata("design:type", Function)
], RWSUploader.prototype, "onStart", void 0);
__decorate([
    attr,
    __metadata("design:type", Function)
], RWSUploader.prototype, "onProgress", void 0);
RWSUploader = __decorate([
    RWSView('rws-uploader')
], RWSUploader);
RWSUploader.defineComponent();
export { RWSUploader };
//# sourceMappingURL=component.js.map