import { DefaultRWSPluginOptionsType } from "../plugins/_plugin";
import IRWSUser from "./IRWSUser";
import { Container } from "../components/_container";
import RWSWindow from "../types/RWSWindow";
import { RWSInfoType } from "../client/components";


export interface IRWSPlugin {
    onClientStart(): Promise<void>
    onPartedComponentsLoad(componentParts: RWSInfoType): Promise<void>
    onComponentsDeclare(): Promise<void>
    onSetUser(user: IRWSUser): Promise<void>
}

type IStaticRWSPluginEntry<PluginOptions extends DefaultRWSPluginOptionsType = DefaultRWSPluginOptionsType> = {    
    new (...args: any[]): IRWSPlugin;
    container: Container;    
    window: RWSWindow;
}

export type IStaticRWSPlugin<PluginOptions extends DefaultRWSPluginOptionsType> =  IStaticRWSPluginEntry<PluginOptions> | [IStaticRWSPluginEntry<PluginOptions>, PluginOptions]