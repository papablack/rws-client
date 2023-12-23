import RWSNotify, { NotifyLogType } from "../types/RWSNotify";
import TheService from "./_service";
/**
 * @class
 * @extends TheService
 */
declare class NotifyService extends TheService {
    private notifier;
    setNotifier(notifier: RWSNotify): void;
    alert(message: string, logType?: NotifyLogType, onConfirm?: (params: any) => void): void;
    notify(message: string, logType?: NotifyLogType, onConfirm?: (params: any) => void): void;
    silent(message: string, logType?: NotifyLogType): void;
}
declare const _default: NotifyService;
export default _default;
/**
 * NotifyService - Handles the notification logic in the application.
 * It includes methods to alert, notify, and silently log messages.
 */
export { NotifyService };
