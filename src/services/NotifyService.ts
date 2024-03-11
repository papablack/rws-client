import RWSNotify, { NotifyLogType } from '../types/RWSNotify';
import TheService from './_service';
/**
 * @class
 * @extends TheService
 */
class NotifyServiceInstance extends TheService {
    private notifier: RWSNotify;

    public setNotifier(notifier: RWSNotify)
    {
        this.notifier = notifier;
    }

    public alert(message: string, logType: NotifyLogType = 'info', onConfirm?: (params: any) => void): void
    {
        if(!this.notifier){
            console.warn('No notifier added to RWS Client');
            return;
        }
        
        this.notifier(message, logType, 'alert', onConfirm);
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

const NotifyService = NotifyServiceInstance.getSingleton();

export default NotifyService;
export { NotifyServiceInstance };