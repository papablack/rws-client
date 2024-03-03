import { RWSViewComponent } from '../../index';
declare class RWSUploader extends RWSViewComponent {
    uploadProgress: number;
    uploadedFile: File;
    chosenFile: File;
    uploadParams: any;
    onFinish: (uploadResponse: any) => void;
    onStart: (chosenFile: File, context: any) => void;
    onProgress: (progress: number) => void;
    onUploadStart(): Promise<void>;
    onChoose(): void;
    removeFile(): void;
    private createFileInput;
    private triggerUpload;
    private removeFileInput;
}
export { RWSUploader };
