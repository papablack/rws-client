import { WSInstance } from "../WSService";
declare function listenForMessage(instance: WSInstance, callback: (data: any, isJson?: boolean) => void, method?: string): WSInstance;
declare function sendMessage<T>(instance: WSInstance, method: string, msg: T): void;
declare const _default: {
    listenForMessage: typeof listenForMessage;
    sendMessage: typeof sendMessage;
};
export default _default;
