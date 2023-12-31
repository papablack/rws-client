/// <reference types="node" />
import TheService from "./_service";
import { Socket } from 'socket.io-client';
import ITheUser from "../interfaces/ITheUser";
type WSEvent = string;
type WSStatus = 'WS_OPEN' | 'WS_CLOSED' | 'WS_CONNECTING';
declare class WSService extends TheService {
    private _ws;
    private user;
    private url;
    private _status_string;
    _wsId: string | null;
    _timeout: NodeJS.Timeout;
    _interval: any;
    _connecting: boolean;
    _shut_down: boolean;
    reconnects: number;
    eventListeners: Map<string, Array<(instance: WSService, params: any) => any>>;
    init(url: string, user?: ITheUser): WSService;
    getStatus(): WSStatus;
    isActive(): boolean;
    listenForMessage(callback: (data: any, isJson?: boolean) => void, method?: string): WSService;
    sendMessage(method: string, msg: any): void;
    statusChange(): void;
    on(event: WSEvent, callback: (wsInstance: WSService, params: any) => any): void;
    executeEventListener(event: WSEvent, params?: any): void;
    socket(): Socket;
    disconnect(): void;
    reconnect(): void;
    getUser(): ITheUser;
    getUrl(): string;
}
declare const _default: WSService;
export default _default;
export { WSService as WSInstance, WSEvent };
