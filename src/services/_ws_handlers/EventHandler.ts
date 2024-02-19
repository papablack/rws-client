import { WSInstance, WSEvent } from '../WSService';

function on(instance: WSInstance, event: WSEvent, callback: (wsInstance: WSInstance, params: any) => any): void {
    let listeners = instance.eventListeners.get(event);
    if (!listeners) {
        listeners = [];
        instance.eventListeners.set(event, listeners);
    }
    listeners.push(callback);
}

function executeEventListener(instance: WSInstance, event: WSEvent, params: any = {}): void {    
    const listeners = instance.eventListeners.get(event);
    if (listeners) {
        listeners.forEach(callback => {
            try {
                callback(instance, params);
            } catch (e) {
                console.error(`Error executing callback for event '${event}':`, e);
            }
        });
    }
}

export default {
    on,
    executeEventListener
};