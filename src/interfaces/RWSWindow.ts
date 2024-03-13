import { RWSClientInstance } from "../client";
import RWSViewComponent from "../components/_component";
import { FoundationElementDefinition, FoundationElementRegistry } from '@microsoft/fast-foundation';

export type RWSWindowComponentInterface = (params?: any) => void;
export type RWSWindowComponentEntry = { interface: RWSWindowComponentInterface, component: any };
export type RWSWindowComponentRegister = { [key: string]: RWSWindowComponentEntry};

export default interface RWSWindow {
    RWS?:{
        client?: RWSClientInstance
        components: RWSWindowComponentRegister
    }
}