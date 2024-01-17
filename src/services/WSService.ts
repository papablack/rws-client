import TheService from "./_service";
import { io, Socket } from 'socket.io-client';
import ITheUser from "../interfaces/ITheUser";
import { v4 as uuid } from 'uuid';
import { ping, disconnect as disconnectWs, reconnect as reconnectWs } from './_ws_handlers/ConnectionHandler';
import WSEventHandler from './_ws_handlers/EventHandler';
import WSMessageHandler from './_ws_handlers/MessageHandler';
import UtilsService from "./UtilsService";

type WSEvent = string;
type WSStatus = 'WS_OPEN' | 'WS_CLOSED' | 'WS_CONNECTING';

function logClickableLink(text: string, url: string) {  
  console.log('[', url, ']:', text);  
}

const getCurrentLineNumber = UtilsService.getCurrentLineNumber;


const  wsLog = async (fakeError: Error, text: any, instance: WSService, isError: boolean = false): Promise<void> => {
  const socket: Socket = instance.socket();  
  const logit = isError ? console.error : console.log;
  logit(`[webpack://junction_ai_trainer_ui/${module.id.replace('./', '')}:${await getCurrentLineNumber(fakeError)}]:`, `<WS-CLIENT>${socket ? `(${socket.id})` : ''}`, text);
}

class WSService extends TheService {
  static websocket_instance: Socket;
  private _ws: Socket | null = null;
  
  
  private user: ITheUser | null = null;
  private url: string | null = null;
  
  private _status_string: WSStatus = 'WS_CLOSED';

  public _wsId: string | null = null;

  
  public _interval: any = null;    
  public _connecting: boolean = false;
  public _shut_down: boolean = false;
  public reconnects: number = 0;

  public eventListeners: Map<string, Array<(instance: WSService, params: any) => any>> = new Map();

  public async init(url: string, user?: ITheUser): Promise<WSService> {
      this._connecting = true;
      wsLog(new Error(), 'Connecting to: ' + url, this);
      this.url = url;
      this.user = user;     
      
      const _self = this;

      const headers = this.user?.jwt_token ? {
          Authorization: 'Bearer ' + this.user?.jwt_token,
      } : {};

      try {
          if(!WSService.websocket_instance){
            WSService.websocket_instance = io(this.url, { extraHeaders: headers, transports:  ['websocket'] });
          }          
        //, transports:  ['websocket']
          this._ws = WSService.websocket_instance;

          if (this.user?.mongoId) {
              this._wsId = this.user.mongoId;
          }else{
            this._wsId = uuid();
          }

          this._ws.on('__PONG__', async (data: any) => {              
              if (data === '__PONG__') {
                  wsLog(new Error(), 'got pong', this);                                                                        
                  return;
              }
          });

          this._ws.on('connect', async () => {
            wsLog(new Error(), 'SOCKET CONNECTED', this);
            this._connecting = false;
            this._ws.connected = true;  
            this.executeEventListener('ws:connected');    
          });

          this._ws.on('disconnect', async (e) => {
              console.error(e);
              wsLog(new Error(), 'Disconnected from the server:', this);
          });

          this._ws.on('error', async (error: Error) => {
              wsLog(error, 'Socket error:', this);

              console.error(error);
          });
          

          // this._interval = setInterval(() => {
          //     ping(_self);
          // }, 3000);

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

  async waitForStatus(): Promise<void>
  {
      return new Promise((resolve, reject) => {
          let iteration = 0;
          const t = setInterval(() => {
              if(iteration > 4){
                  clearInterval(t);
                  reject('Websocket did not connect!');                  
              }

              if(this.isActive()){                        
                  clearInterval(t);
                  resolve();                  
              }

              iteration++;
          }, 1000);
      });
  }

  public async sendMessage<T>(method: string, msg: T): Promise<void> {       
    //await this.waitForStatus();    
    const the_message = {
      user_id: this._wsId,
      method: method,
      msg: msg
    }

    this.socket().emit(method, JSON.stringify(the_message));
    //WSMessageHandler.sendMessage(this, method, msg);
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