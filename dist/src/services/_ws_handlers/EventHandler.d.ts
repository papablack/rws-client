import { WSInstance, WSEvent } from "../WSService";
declare function on(instance: WSInstance, event: WSEvent, callback: (wsInstance: WSInstance, params: any) => any): void;
declare function executeEventListener(instance: WSInstance, event: WSEvent, params?: any): void;
declare const _default: {
    on: typeof on;
    executeEventListener: typeof executeEventListener;
};
export default _default;
