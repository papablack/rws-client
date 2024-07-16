import {DI, Container, Key, Registration , InterfaceSymbol} from '@microsoft/fast-foundation';
import {loadRWSRichWindow} from '../types/RWSWindow';

export default () => {
    const richWindow = loadRWSRichWindow();            

    if(richWindow.RWS.container){        
        return richWindow.RWS.container;
    }
    
    richWindow.RWS.container = DI.getOrCreateDOMContainer(richWindow.RWS.container_node);    

    return richWindow.RWS.container;
};

export { DI, Container, Key, Registration, InterfaceSymbol }