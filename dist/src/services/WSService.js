import TheService from "./_service";
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { ping, disconnect as disconnectWs, reconnect as reconnectWs } from './_ws_handlers/ConnectionHandler';
import WSEventHandler from './_ws_handlers/EventHandler';
import WSMessageHandler from './_ws_handlers/MessageHandler';
import UtilsService from "./UtilsService";
function logClickableLink(text, url) {
    console.log('[', url, ']:', text);
}
const getCurrentLineNumber = UtilsService.getCurrentLineNumber;
const wsLog = async (fakeError, text, socketId = null, isError = false) => {
    const logit = isError ? console.error : console.log;
    logit(`[webpack://junction_ai_trainer_ui/${module.id.replace('./', '')}:${await getCurrentLineNumber(fakeError)}]:`, `<WS-CLIENT>${socketId ? `(${socketId})` : ''}`, text);
};
class WSService extends TheService {
    constructor() {
        super(...arguments);
        this._ws = null;
        this.user = null;
        this.url = null;
        this._status_string = 'WS_CLOSED';
        this._wsId = null;
        this._interval = null;
        this._connecting = false;
        this._shut_down = false;
        this.reconnects = 0;
        this.eventListeners = new Map();
    }
    async init(url, user) {
        var _a, _b, _c, _d;
        this._connecting = true;
        wsLog(new Error(), 'Connecting to: ' + url);
        this.url = url;
        this.user = user;
        const _self = this;
        const headers = ((_a = this.user) === null || _a === void 0 ? void 0 : _a.jwt_token) ? {
            Authorization: 'Bearer ' + ((_b = this.user) === null || _b === void 0 ? void 0 : _b.jwt_token),
        } : {};
        try {
            if (!WSService.websocket_instance) {
                WSService.websocket_instance = io(this.url, { extraHeaders: headers, transports: ['websocket'] });
            }
            //, transports:  ['websocket']
            this._ws = WSService.websocket_instance;
            if ((_c = this.user) === null || _c === void 0 ? void 0 : _c.mongoId) {
                this._wsId = this.user.mongoId;
            }
            else {
                this._wsId = uuid();
            }
            let socketId = null;
            this._ws.on('connect', () => {
                socketId = this.socket().id;
                wsLog(new Error(), 'Socket connected with ID: ' + socketId, socketId);
                this._connecting = false;
                this._ws.connected = true;
                this.executeEventListener('ws:connected');
                wsLog(new Error(), 'Emitting ping to server', socketId);
                ping(this);
            });
            this._ws.on('__PONG__', async (data) => {
                if (data === '__PONG__') {
                    wsLog(new Error(), 'Recieveing valid ping callback from server', socketId);
                    return;
                }
            });
            this._ws.on('disconnect', async (e) => {
                wsLog(new Error(), `Disconnected from the server`, socketId);
                this.executeEventListener('ws:disconnected', { socketId: socketId, error: e });
                socketId = null;
            });
            this._ws.on('error', async (error) => {
                wsLog(error, 'Socket error:', socketId, true);
                console.error(error);
                this.executeEventListener('ws:error', { socketId: socketId, error: error });
            });
            // this._interval = setInterval(() => {
            //     ping(_self);
            // }, 3000);
            this.reconnects = 0;
            if ((_d = this._ws) === null || _d === void 0 ? void 0 : _d.connected) {
                this._connecting = false;
            }
            this.statusChange();
        }
        catch (e) {
            throw e;
        }
        return this;
    }
    getStatus() {
        return this._status_string;
    }
    isActive() {
        var _a;
        return !this._connecting && ((_a = this._ws) === null || _a === void 0 ? void 0 : _a.connected);
    }
    listenForMessage(callback, method) {
        return WSMessageHandler.listenForMessage(this, callback, method);
    }
    async waitForStatus() {
        return new Promise((resolve, reject) => {
            let iteration = 0;
            const t = setInterval(() => {
                if (iteration > 4) {
                    clearInterval(t);
                    reject('Websocket did not connect!');
                }
                if (this.isActive()) {
                    clearInterval(t);
                    resolve();
                }
                iteration++;
            }, 1000);
        });
    }
    async sendMessage(method, msg) {
        //await this.waitForStatus();    
        const the_message = {
            user_id: this._wsId,
            method: method,
            msg: msg
        };
        this.socket().emit(method, JSON.stringify(the_message));
        //WSMessageHandler.sendMessage(this, method, msg);
    }
    statusChange() {
        let status = 'WS_CLOSED';
        if (this._connecting) {
            status = 'WS_CONNECTING';
        }
        else if (this.isActive()) {
            status = 'WS_OPEN';
        }
        this.executeEventListener('ws:status_change', { status });
        this._status_string = status;
    }
    on(event, callback) {
        WSEventHandler.on(this, event, callback);
    }
    executeEventListener(event, params = {}) {
        WSEventHandler.executeEventListener(this, event, params);
    }
    socket() {
        return this._ws;
    }
    disconnect() {
        disconnectWs(this);
    }
    reconnect() {
        reconnectWs(this);
    }
    getUser() {
        return this.user;
    }
    getUrl() {
        return this.url;
    }
}
export default WSService.getSingleton();
export { WSService as WSInstance };
//# sourceMappingURL=WSService.js.map