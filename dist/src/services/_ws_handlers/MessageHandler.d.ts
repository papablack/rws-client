import { WSInstance } from "../WSService";
declare function listenForMessage(instance: WSInstance, callback: (data: any, isJson?: boolean) => void, method?: string): WSInstance;
declare function sendMessage(instance: WSInstance, method: string, msg: any): void;
declare const _default: {
    listenForMessage: typeof listenForMessage;
    sendMessage: typeof sendMessage;
};
export default _default;
