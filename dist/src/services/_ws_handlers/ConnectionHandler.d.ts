import { WSInstance } from "../WSService";
declare function ping(instance: WSInstance): void;
declare function reconnect(instance: WSInstance): void;
declare function disconnect(instance: WSInstance, noEvent?: boolean): void;
export { ping, reconnect, disconnect };
