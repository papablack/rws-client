import TheService from "./_service";
import { io, Socket } from 'socket.io-client';
import ITheUser from "../interfaces/ITheUser";
import { v4 as uuid } from 'uuid';
import { ping, disconnect as disconnectWs, reconnect as reconnectWs } from './_ws_handlers/ConnectionHandler';
import WSEventHandler from './_ws_handlers/EventHandler';
import WSMessageHandler from './_ws_handlers/MessageHandler';

type WSEvent = string;
type WSStatus = 'WS_OPEN' | 'WS_CLOSED' | 'WS_CONNECTING';

class WSService extends TheService {
  private _ws: Socket | null = null;
  
  
  private user: ITheUser | null = null;
  private url: string | null = null;
  
  private _status_string: WSStatus = 'WS_CLOSED';

  public _wsId: string | null = null;

  public _timeout: NodeJS.Timeout = null;
  public _interval: any = null;    
  public _connecting: boolean = false;
  public _shut_down: boolean = false;
  public reconnects: number = 0;

  public eventListeners: Map<string, Array<(instance: WSService, params: any) => any>> = new Map();

  public init(url: string, user?: ITheUser): WSService {
      this._connecting = true;
      console.info('WS CONNECTING');
      this.url = url;
      this.user = user;     
      
      const _self = this;

      const headers = this.user?.jwt_token ? {
          Authorization: 'Bearer ' + this.user?.jwt_token,
      } : {};

      try {
        //, transports:  ['websocket']
          this._ws = io(this.url, { extraHeaders: headers });

          if (this.user?.mongoId) {
              this._wsId = this.user.mongoId;
          }else{
            this._wsId = uuid();
          }

          this._ws.on('__PONG__', (data: any) => {              
              if (data === '__PONG__') {
                  if(this._connecting){
                    console.info('[WS] SOCKET CONNECTED');    
                    this.executeEventListener('ws:connected');  
                  }
                  this._connecting = false;
                  this._ws.connected = true                                          
                  clearTimeout(this._timeout);                  
                  return;
              }
          });

          this._ws.on('disconnect', () => {
              console.log('[WS] Disconnected from the server');
          });

          this._ws.on('error', (error: Error) => {
              console.error('[WS] WebSocket error:', error);
          });
          

          this._interval = setInterval(() => {
              ping(_self);
          }, 3000);

          this.reconnects = 0;

          if (this._ws?.connected) {
              this._connecting = false;
          }

          this.statusChange();
      } catch (e) {
          throw e;
      }

      return this;
  }

  public getStatus(): WSStatus {
    return this._status_string;
  }  

  public isActive(): boolean {
      return !this._connecting && this._ws?.connected;
  }

  public listenForMessage(callback: (data: any, isJson?: boolean) => void, method?: string): WSService {
      return WSMessageHandler.listenForMessage(this, callback, method);
  }

  public sendMessage(method: string, msg: any): void {
    WSMessageHandler.sendMessage(this, method, msg);
  } 

  public statusChange(): void {
      let status: WSStatus = 'WS_CLOSED';
      if (this._connecting) {
          status = 'WS_CONNECTING';
      } else if (this.isActive()) {
          status = 'WS_OPEN';
      }

      this.executeEventListener('ws:status_change', { status });      
      this._status_string = status;
  }

  public on(event: WSEvent, callback: (wsInstance: WSService, params: any) => any): void {
    WSEventHandler.on(this, event, callback);
  }

  public executeEventListener(event: WSEvent, params: any = {}): void {
    WSEventHandler.executeEventListener(this, event, params);
  }

  public socket(): Socket
  {
    return this._ws;
  }

  public disconnect()
  {
    disconnectWs(this);
  }

  public reconnect()
  {
    reconnectWs(this);
  }

  getUser(): ITheUser {
    return this.user;
  }

  getUrl(): string {
    return this.url;
  }
}

export default WSService.getSingleton();
export { WSService as WSInstance, WSEvent }