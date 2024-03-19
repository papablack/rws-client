import RWSClient, { RWSClientInstance } from "./client";
import RWSContainer from "./components/_container";
import { RWSPluginDetector } from "./components/_decorator";

type BasePluginOptions = {
    enabled: boolean,
    asyncCallbacks: boolean
}

export type CallbackType = (client: RWSClientInstance, eventParams?: any) => Promise<RWSClientInstance>;

export type CallbacksHolder = {
    onClientStart: CallbackType,
    onClientSetup: CallbackType,
    onPartedComponentAppend: CallbackType,
    onPartedComponentsDone: CallbackType,
    onInitDone: CallbackType,
};

const _defaultOpts: BasePluginOptions = {
    enabled: true,
    asyncCallbacks: false
};

@RWSPluginDetector()
export abstract class RWSPlugin<ChildOptionsType extends BasePluginOptions = BasePluginOptions> {  
    protected options?: ChildOptionsType = _defaultOpts as ChildOptionsType;  
    protected client?: RWSClientInstance

    static componentsDir: string | null = null;

    constructor(options: Partial<ChildOptionsType>, client?: RWSClientInstance){
        if(client){
            this.bind(client);
        }

        this.options = {..._defaultOpts, ...options} as ChildOptionsType;

        this.initPlugin();
    }

    protected callbacks: CallbacksHolder = {
        onClientStart: async (client: RWSClientInstance) => client,
        onClientSetup: async (client: RWSClientInstance) => client,
        onPartedComponentAppend: async (client: RWSClientInstance) => client,
        onPartedComponentsDone: async (client: RWSClientInstance) => client,
        onInitDone: async (client: RWSClientInstance) => client,
    } 
    
    protected initPlugin(): void {
        throw new Error(`Class "${this.constructor.name}" needs to have method "initPlugin()" defined`);
    }

    onClientSetup(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {            
        this.callbacks.onClientSetup = callback;
        return this;
    }

    onClientStart(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {            
        this.callbacks.onClientStart = callback;
        return this;
    }

    onPartedComponentAppend(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {            
        this.callbacks.onPartedComponentAppend = callback;
        return this;
    }

    onPartedComponentsDone(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {            
        this.callbacks.onPartedComponentsDone = callback;
        return this;
    }

    onInitDone(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {            
        this.callbacks.onInitDone = callback;
        return this;
    }

    async runCallback(eventName: string, eventParams?: any): Promise<RWSClientInstance>
    {
        if(!Object.keys(this.callbacks).includes(eventName)){
            throw new Error(`No event called "${eventName}"`);
        }

        const eventCallback = this.callbacks[eventName as keyof CallbacksHolder].bind(this);

        return new Promise((resolve) => {
            if(this.options.asyncCallbacks){
                eventCallback(this.client, eventParams).then(resolve);
            }
    
            eventCallback(this.client, eventParams).then();
            resolve(this.client);
        })        
    }    
    
    bind(client: RWSClientInstance): RWSPlugin<ChildOptionsType>
    {
        this.client = client;
        return this;
    }

    protected checkClient(): void
    {
        if(!this.client){
            throw new Error('No client bound to plugin.')
        }
    }

    static injectPlugin<ChildOptionsType>(
        constructor: { new(opts?: Partial<ChildOptionsType>): any },
        options?: Partial<ChildOptionsType>)
    {
        const client: RWSClientInstance = RWSContainer().get<RWSClientInstance>(RWSClient);
        client.addPlugin(new constructor(options));
    }
}