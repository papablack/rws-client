import RWSClient, { RWSClientInstance } from "./client";
import RWSContainer from "./components/_container";

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

export class RWSPlugin<ChildOptionsType extends BasePluginOptions = BasePluginOptions> {  
    private options?: ChildOptionsType = _defaultOpts as ChildOptionsType;  
    private client?: RWSClientInstance

    constructor(options: Partial<ChildOptionsType>, client?: RWSClientInstance){
        if(client){
            this.bind(client);
        }

        this.options = {..._defaultOpts, ...options} as ChildOptionsType;
    }

    protected callbacks: CallbacksHolder = {
        onClientStart: async (client: RWSClientInstance) => client,
        onClientSetup: async (client: RWSClientInstance) => client,
        onPartedComponentAppend: async (client: RWSClientInstance) => client,
        onPartedComponentsDone: async (client: RWSClientInstance) => client,
        onInitDone: async (client: RWSClientInstance) => client,
    }    

    onClientSetup(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {    
        const call = callback;
        this.callbacks.onClientSetup = call;
        return this;
    }

    onClientStart(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {    
        const call = callback;
        this.callbacks.onClientStart = call;
        return this;
    }

    onPartedComponentAppend(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {    
        const call = callback;
        this.callbacks.onPartedComponentAppend = call;
        return this;
    }

    onPartedComponentsDone(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {    
        const call = callback;
        this.callbacks.onPartedComponentsDone = call;
        return this;
    }

    onInitDone(this: RWSPlugin<ChildOptionsType>, callback: CallbackType): RWSPlugin<ChildOptionsType>
    {    
        const call = callback;
        this.callbacks.onInitDone = call;
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

    static injectPlugin<ChildOptionsType>(options?: Partial<ChildOptionsType>)
    {
        const client: RWSClientInstance = RWSContainer().get<RWSClientInstance>(RWSClient);
        client.addPlugin(new RWSPlugin(options));
    }
}