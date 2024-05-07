import { IRWSConfig, IRWSUser } from "../index";
import { RWSClientInstance } from "../client";
import startClient from '../run';

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
    this.wsService.setUser(this.user);

    localStorage.setItem('the_rws_user', JSON.stringify(this.user));

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

async function setup(this: RWSClientInstance, config: IRWSConfig = {}): Promise<IRWSConfig> {
    if (this.isSetup) {
        return this.config;
    }

    this.config = { ...this.config, ...config };
    this.appConfig.mergeConfig(this.config);

    if (this.appConfig.get('parted')) {
        await this.loadPartedComponents();            
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

    if (this.config.user && !this.config.dontPushToSW) {
        this.pushUserToServiceWorker(this.user);
    }

    await startClient(this.appConfig, this.wsService, this.notifyService, this.routingService);        

    await this.initCallback();        

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