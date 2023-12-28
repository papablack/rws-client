function on(instance, event, callback) {
    let listeners = instance.eventListeners.get(event);
    if (!listeners) {
        listeners = [];
        instance.eventListeners.set(event, listeners);
    }
    listeners.push(callback);
}
function executeEventListener(instance, event, params = {}) {
    const listeners = instance.eventListeners.get(event);
    if (listeners) {
        listeners.forEach(callback => {
            try {
                callback(instance, params);
            }
            catch (e) {
                console.error(`Error executing callback for event '${event}':`, e);
            }
        });
    }
}
export default {
    on,
    executeEventListener
};
//# sourceMappingURL=EventHandler.js.map