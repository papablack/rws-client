import RWSContainer from "../components/_container";
import { Container } from "../components/_container";
import RWSWindow, {loadRWSRichWindow } from '../types/RWSWindow';
import IRWSUser from "../types/IRWSUser";
import { RWSInfoType } from "../client/components";
import { IRWSPlugin } from "../types/IRWSPlugin";

type DefaultRWSPluginOptionsType = { enabled: boolean };
type PluginInfoType = { name: string }
type PluginConstructor<T extends DefaultRWSPluginOptionsType> = new (options: T) => RWSPlugin<T>;
abstract class RWSPlugin<PluginOptions extends DefaultRWSPluginOptionsType> implements IRWSPlugin{
    protected isLoaded: boolean = false;
    protected options: PluginOptions;
    protected container: Container;    
    protected window: RWSWindow;

    static container: Container;    
    static window: RWSWindow;

    constructor(options: PluginOptions = { enabled: false } as PluginOptions){
        this.isLoaded = true;
        this.container = RWSPlugin.container;
        this.window = RWSPlugin.window;
        this.options = options;
    }

    async onClientStart(): Promise<void>
    {
        
    }

    async onPartedComponentsLoad(componentParts: RWSInfoType): Promise<void>
    {
        
    }

    async onComponentsDeclare(): Promise<void>
    {
        
    }

    async onSetUser(user: IRWSUser): Promise<void>{

    }

    
    
    static getPlugin<Plugin extends RWSPlugin<T>, T extends DefaultRWSPluginOptionsType = DefaultRWSPluginOptionsType>(pluginClass: PluginConstructor<T>): Plugin | null 
    {
        const plugin = this.window.RWS.plugins[pluginClass.name];
        return plugin ? plugin as Plugin : null;
    }


    static getAllPlugins(): RWSPlugin<DefaultRWSPluginOptionsType>[]
    {
        return Object.keys(this.window.RWS.plugins).map((key) => this.window.RWS.plugins[key]);
    }
}

RWSPlugin.window = loadRWSRichWindow();
RWSPlugin.container = RWSContainer();

export { RWSPlugin, DefaultRWSPluginOptionsType }