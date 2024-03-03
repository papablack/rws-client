type NotifyUiType = 'alert' | 'notification' | 'silent';
type NotifyLogType = 'info' | 'error' | 'warning';
type RWSNotify = (message: string, logType?: NotifyLogType, uiType?: NotifyUiType, onConfirm?: (params?: any) => void) => any;
export default RWSNotify;
export { NotifyUiType, NotifyLogType };
