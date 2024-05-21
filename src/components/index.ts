import { RWSUploader } from './uploader/component';
import { RWSProgress } from './progress/component';
import { RWSLoader } from './loader/component';


function declareRWSComponents(parted: boolean = false): void
{
    if(!parted){
        RWSUploader;        
        RWSProgress;
        RWSLoader;
    }
}

export { declareRWSComponents };