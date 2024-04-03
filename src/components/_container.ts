import { DI } from '@microsoft/fast-foundation';
import {loadRWSRichWindow} from '../interfaces/RWSWindow';

import 'reflect-metadata';

export default () => {
    const richWindow = loadRWSRichWindow();            

    if(richWindow.RWS.container){        
        return richWindow.RWS.container;
    }
    
    richWindow.RWS.container = DI.getOrCreateDOMContainer(richWindow.RWS.container_node);    

    return richWindow.RWS.container;
};