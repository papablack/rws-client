import RWSNotify, { NotifyLogType } from '../types/RWSNotify';
import TheService from './_service';
/**
 * @class
 * @extends TheService
 */
class NotifyService extends TheService {
    static _DEFAULT: boolean = true;
    private notifier: RWSNotify;

    public setNotifier(notifier: RWSNotify)
    {
        this.notifier = notifier;
    }

    public alert(message: string, logType: NotifyLogType = 'info', onConfirm?: (params: any) => void, alertOptions?: any): any
    {
        if(!this.notifier){
            console.warn('No notifier added to RWS Client');
            return;
        }
        
        return this.notifier(message, logType, 'alert', onConfirm, alertOptions);
    }

    public notify(message: string, logType: NotifyLogType = 'info', onConfirm?: (params: any) => void): void
    {
        if(!this.notifier){
            console.warn('No notifier added to RWS Client');
            return;
        }

        this.notifier(message, logType, 'notification', onConfirm);
    }

    public silent(message: string, logType: NotifyLogType = 'info'): void
    {
        if(!this.notifier){
            console.warn('No notifier added to RWS Client');
            return;
        }

        this.notifier(message, logType, 'silent');
    }
}

export default NotifyService.getSingleton();
export { NotifyService as NotifyServiceInstance };