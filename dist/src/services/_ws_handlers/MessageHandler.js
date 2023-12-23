function listenForMessage(instance, callback, method) {
    if (!instance.socket()) {
        instance.init(instance.getUrl(), instance.getUser());
    }
    instance.socket().on(method || 'message', (data) => {
        try {
            const parsedData = JSON.parse(data);
            if (!!method && parsedData.method === method) {
                callback(parsedData, true);
                instance.executeEventListener('ws:message_received', { message: parsedData });
            }
            else if (!method) {
                callback(parsedData, true);
            }
        }
        catch (e) {
            if (!method) {
                console.error(e);
                callback(data);
            }
        }
    });
    return instance;
}
function sendMessage(instance, method, msg) {
    try {
        if (!instance.socket()) {
            instance.init(instance.getUrl(), instance.getUser());
        }
        const the_message = {
            user_id: instance._wsId,
            method: method,
            msg: msg
        };
        instance.socket().emit(method, JSON.stringify(the_message));
        instance.executeEventListener('ws:message_sent', { message: the_message });
    }
    catch (e) {
        throw e;
    }
}
export default {
    listenForMessage,
    sendMessage
};
//# sourceMappingURL=MessageHandler.js.map