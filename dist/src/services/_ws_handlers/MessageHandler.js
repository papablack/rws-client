function listenForMessage(instance, callback, method) {
    if (!instance.socket()) {
        throw new Error('socket is not active');
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
            console.error(e);
            if (!method) {
                callback(data);
            }
        }
    });
    return instance;
}
function sendMessage(instance, method, msg) {
    if (!instance.socket()) {
        throw new Error('socket is not active');
    }
    const the_message = {
        user_id: instance.socket().id,
        method: method,
        msg: msg
    };
    instance.socket().emit(method, JSON.stringify(the_message));
    instance.executeEventListener('ws:message_sent', { message: the_message });
}
export default {
    listenForMessage,
    sendMessage
};
//# sourceMappingURL=MessageHandler.js.map