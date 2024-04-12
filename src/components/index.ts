import { RWSUploader } from './uploader/component';
import { RouterComponent } from './router/component';
import { RWSProgress } from './progress/component';
import { RWSLoader } from './loader/component';


function declareRWSComponents(parted: boolean = false): void
{
    if(!parted){
        RWSUploader;
        RouterComponent;
        RWSProgress;
        RWSLoader;
    }
}

export { declareRWSComponents };