import { RWSClientInstance } from "../client";
import { Container, InterfaceSymbol } from '@microsoft/fast-foundation';
import { v1 as uuid} from 'uuid';
import { IWithDI } from "../services/_service";
export type RWSWindowComponentInterface = (params?: any) => void;
export type RWSWindowComponentEntry = { interface: RWSWindowComponentInterface, component: any };
export type RWSWindowComponentRegister = { [key: string]: RWSWindowComponentEntry};

export function loadRWSRichWindow(): RWSWindow
{
    const richWindow: RWSWindow = window;

    if(!richWindow.RWS){
        const newNode = document.createElement('main');
        newNode.id = 'rws-cntr-id-' + uuid();

        console.log('Created container on node: ', newNode.id);

        richWindow.RWS = {
            client: null,
            components: {},
            container: null,
            container_node: newNode,
            _registered: {}
        }
    }    

    return richWindow;
}

export default interface RWSWindow extends Window {
    RWS?:{
        client?: RWSClientInstance
        components: RWSWindowComponentRegister
        container: Container | null
        container_node: Element | null
        _registered: {[key: string]: InterfaceSymbol<any>};
    }
}