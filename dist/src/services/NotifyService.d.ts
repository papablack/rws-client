import RWSNotify, { NotifyLogType } from '../types/RWSNotify';
import TheService from './_service';
/**
 * @class
 * @extends TheService
 */
declare class NotifyServiceInstance extends TheService {
    private notifier;
    setNotifier(notifier: RWSNotify): void;
    alert(message: string, logType?: NotifyLogType, onConfirm?: (params: any) => void): void;
    notify(message: string, logType?: NotifyLogType, onConfirm?: (params: any) => void): void;
    silent(message: string, logType?: NotifyLogType): void;
}
export default NotifyServiceInstance;
declare const NotifyService: NotifyServiceInstance;
export { NotifyService };
