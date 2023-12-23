import TheService from "./_service";
/**
 * @class
 * @extends TheService
 */
class NotifyService extends TheService {
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
export default NotifyService.getSingleton();
/**
 * NotifyService - Handles the notification logic in the application.
 * It includes methods to alert, notify, and silently log messages.
 */
export { NotifyService };
//# sourceMappingURL=NotifyService.js.map