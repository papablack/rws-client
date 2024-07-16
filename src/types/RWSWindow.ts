import { RWSClientInstance } from '../client';
import { Container, InterfaceSymbol } from '../components/_container';

import { RWSPlugin, DefaultRWSPluginOptionsType } from '../plugins/_plugin';
import { v1 as uuid} from 'uuid';
export type RWSWindowComponentInterface = (params?: any) => void;
export type RWSWindowComponentEntry = { interface: RWSWindowComponentInterface, component: any };
export type RWSWindowComponentRegister = { [key: string]: RWSWindowComponentEntry};

export function loadRWSRichWindow(): RWSWindow
{
    const richWindow: RWSWindow = window;

    if(!richWindow.RWS){
        const newNode = document.createElement('main');
        newNode.id = 'rws-cntr-id-' + uuid();
        
        console.log('\x1b[1m[RWS]\x1b[0m Created new container node: ', newNode.id);

        richWindow.RWS = {
            client: null,
            components: {},
            plugins: {},
            container: null,
            container_node: newNode,
            _registered: {}
        };
    }    

    return richWindow;
}

export default interface RWSWindow extends Window {
    RWS?: {
        client?: RWSClientInstance
        components: RWSWindowComponentRegister
        plugins: {[key: string]: RWSPlugin<DefaultRWSPluginOptionsType>}
        container: Container | null
        container_node: Element | null
        _registered: {[key: string]: InterfaceSymbol<any>};
    }
}