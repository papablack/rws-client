import TheService from './_service';
/**
 * @class
 * @extends TheService
 */
class NotifyServiceInstance extends TheService {
    setNotifier(notifier) {
        this.notifier = notifier;
    }
    alert(message, logType = 'info', onConfirm) {
        if (!this.notifier) {
            console.warn('No notifier added to RWS Client');
            return;
        }
        this.notifier(message, logType, 'alert', onConfirm);
    }
    notify(message, logType = 'info', onConfirm) {
        if (!this.notifier) {
            console.warn('No notifier added to RWS Client');
            return;
        }
        this.notifier(message, logType, 'notification', onConfirm);
    }
    silent(message, logType = 'info') {
        if (!this.notifier) {
            console.warn('No notifier added to RWS Client');
            return;
        }
        this.notifier(message, logType, 'silent');
    }
}
export default NotifyServiceInstance;
const NotifyService = NotifyServiceInstance.getSingleton();
export { NotifyService };
//# sourceMappingURL=NotifyService.js.map