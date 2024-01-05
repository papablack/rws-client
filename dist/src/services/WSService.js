import TheService from "./_service";
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { ping, disconnect as disconnectWs, reconnect as reconnectWs } from './_ws_handlers/ConnectionHandler';
import WSEventHandler from './_ws_handlers/EventHandler';
import WSMessageHandler from './_ws_handlers/MessageHandler';
class WSService extends TheService {
    constructor() {
        super(...arguments);
        this._ws = null;
        this.user = null;
        this.url = null;
        this._status_string = 'WS_CLOSED';
        this._wsId = null;
        this._timeout = null;
        this._interval = null;
        this._connecting = false;
        this._shut_down = false;
        this.reconnects = 0;
        this.eventListeners = new Map();
    }
    init(url, user) {
        var _a, _b, _c, _d;
        this._connecting = true;
        console.info('WS CONNECTING');
        this.url = url;
        this.user = user;
        const _self = this;
        const headers = ((_a = this.user) === null || _a === void 0 ? void 0 : _a.jwt_token) ? {
            Authorization: 'Bearer ' + ((_b = this.user) === null || _b === void 0 ? void 0 : _b.jwt_token),
        } : {};
        try {
            //, transports:  ['websocket']
            this._ws = io(this.url, { extraHeaders: headers });
            if ((_c = this.user) === null || _c === void 0 ? void 0 : _c.mongoId) {
                this._wsId = this.user.mongoId;
            }
            else {
                this._wsId = uuid();
            }
            this._ws.on('__PONG__', (data) => {
                if (data === '__PONG__') {
                    if (this._connecting) {
                        console.info('[WS] SOCKET CONNECTED');
                        this.executeEventListener('ws:connected');
                    }
                    this._connecting = false;
                    this._ws.connected = true;
                    clearTimeout(this._timeout);
                    return;
                }
            });
            this._ws.on('disconnect', () => {
                console.log('[WS] Disconnected from the server');
            });
            this._ws.on('error', (error) => {
                console.error('[WS] WebSocket error:', error);
            });
            this._interval = setInterval(() => {
                ping(_self);
            }, 3000);
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
    sendMessage(method, msg) {
        WSMessageHandler.sendMessage(this, method, msg);
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