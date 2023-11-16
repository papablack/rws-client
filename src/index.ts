import IRWSConfig from './interfaces/IRWSConfig';
import startClient from './run';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import NotifyService from './services/NotifyService';

class RWSClient {
    private config: IRWSConfig;

    async start(config: IRWSConfig): Promise<boolean> {    
        this.config = config;
        await startClient(this.config);
    
        return true;
    }

    public setNotifier(notifier: RWSNotify)
    {
        NotifyService.setNotifier(notifier);
    }
}

export default RWSClient;
export { NotifyUiType, NotifyLogType }