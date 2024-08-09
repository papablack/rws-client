import { IRWSConfig, IRWSUser, IStaticRWSPlugin } from "../index";
import { RWSClientInstance } from "../client";

import { RWSPlugin, DefaultRWSPluginOptionsType } from "../plugins/_plugin";
import RWSWindow, {loadRWSRichWindow } from '../types/RWSWindow';
import deepmerge from 'deepmerge';

type RWSInfoType = { components: string[] };

function getUser(this: RWSClientInstance): IRWSUser {

    const localSaved = localStorage.getItem('the_rws_user');

    if (localSaved) {
        this.setUser(JSON.parse(localSaved) as IRWSUser);
    }

    return this.user;
}

function setUser(this: RWSClientInstance, user: IRWSUser): RWSClientInstance {
    if (!user || !user?.jwt_token) {
        console.warn('[RWS Client Warning]', 'Passed user is not valid', user);
        return this;
    }

    this.user = user;

    this.apiService.setToken(this.user.jwt_token);

    localStorage.setItem('the_rws_user', JSON.stringify(this.user));

    for(const plugin of RWSPlugin.getAllPlugins()){
        plugin.onSetUser(user);
    }

    return this;
}

function pushDataToServiceWorker(this: RWSClientInstance, type: string, data: any, asset_type: string = 'data_push'): void {
    let tries = 0;

    const doIt: () => void = () => {
        try {
            this.swService.sendDataToServiceWorker(type, data, asset_type);
        } catch (e) {
            if (tries < 3) {
                setTimeout(() => { doIt(); }, 300);
                tries++;
            }
        }
    };

    doIt();
}

function pushUserToServiceWorker(this: RWSClientInstance, userData: any) {
    this.setUser(userData);
    this.pushDataToServiceWorker('SET_USER', userData, 'logged_user');
}

function get(this: RWSClientInstance, key: string): any | null
{
    if(Object.keys(this.customServices).includes(key)){
        return this.customServices[key];
    }

    if(Object.keys(this.defaultServices).includes(key)){
        return this.defaultServices[key];
    }

    return null;
}

type PluginConstructor<T extends DefaultRWSPluginOptionsType> = new (options: T) => RWSPlugin<T>;
type RWSPluginEntry = IStaticRWSPlugin;

function addPlugin<T  extends DefaultRWSPluginOptionsType>(this: RWSClientInstance, pluginEntry: RWSPluginEntry){
    const rwsWindow: RWSWindow = loadRWSRichWindow();
    const pluginClass: PluginConstructor<T> = (Array.isArray(pluginEntry) ? pluginEntry[0] : pluginEntry) as PluginConstructor<T>;
    const pluginOptions: T = (Array.isArray(pluginEntry) ? pluginEntry[1] : { enabled: true }) as T;

    if(!Object.keys(rwsWindow.RWS.plugins).includes(pluginClass.name)){       
        const pluginInstance: RWSPlugin<T> = new pluginClass(pluginOptions);
        this.plugins[pluginClass.name] = pluginInstance; 
        rwsWindow.RWS.plugins[pluginClass.name] = pluginInstance;
    }
}

async function setup(this: RWSClientInstance, config: IRWSConfig = {}): Promise<IRWSConfig> {
    if (this.isSetup) {
        return this.config;
    }    

    if(this.config){
        this.config = deepmerge(this.config, config);
    }    

    this.appConfig.mergeConfig(this.config);    

    if(this.config.plugins){                
        for (const pluginEntry of this.config.plugins){
            addPlugin.bind(this)(pluginEntry);
        }
    }

    if(config?.user){
        this.setUser(config.user);
    }

    if (this.appConfig.get('parted')) {
        const componentParts = await this.loadPartedComponents();

        for (const plugin of RWSPlugin.getAllPlugins()){
            plugin.onPartedComponentsLoad(componentParts);
        }
    }               

    this.isSetup = true;
    return this.config;
}

async function start(this: RWSClientInstance, config: IRWSConfig = {}): Promise<RWSClientInstance> {
    this.config = { ...this.config, ...config };
    
    if (!this.isSetup) {
        this.config = await this.setup(this.config);
    }

    if (Object.keys(config).length) {
        this.appConfig.mergeConfig(this.config);
    }            

    const setThisUser = config?.user || this.getUser();

    if(setThisUser){
        this.config.user = setThisUser;
        this.setUser(setThisUser);
    }

    if (this.config.user && !this.config.dontPushToSW) {
        this.pushUserToServiceWorker(this.user);
    }

    await this.initCallback();        

    for (const plugin of RWSPlugin.getAllPlugins()){                
        await plugin.onClientStart();
    }

    return this;
}

function getBinds(this: RWSClientInstance) {
    return {
        start: start.bind(this),
        setup: setup.bind(this),        
        get: get.bind(this),
        setUser: setUser.bind(this),
        getUser: getUser.bind(this),
        pushDataToServiceWorker: pushDataToServiceWorker.bind(this),
        pushUserToServiceWorker: pushUserToServiceWorker.bind(this)
    };
}

export default getBinds;