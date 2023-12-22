import { WSInstance } from "../WSService";

function listenForMessage(instance: WSInstance, callback: (data: any, isJson?: boolean) => void, method?: string): WSInstance {
    if (!instance.socket()) {
        instance.init(instance.getUrl(), instance.getUser());
    }

    instance.socket().on(method || 'message', (data: any) => {
        try {            
            const parsedData = JSON.parse(data);
            if (!!method && parsedData.method === method) {
                callback(parsedData, true);
                instance.executeEventListener('ws:message_received', { message: parsedData });

            } else if (!method) {
                callback(parsedData, true);
            }
        } catch (e) {
            if (!method) {
                console.error(e);
                callback(data);
            }
        }
    });

    return instance;
}

function sendMessage(instance: WSInstance, method: string, msg: any): void {
    try {
        if (!instance.socket()) {
            instance.init(instance.getUrl(), instance.getUser());
        }

        const the_message = {
          user_id: instance._wsId,
          method: method,
          msg: msg
        }
    
        instance.socket().emit(method, JSON.stringify(the_message));

        instance.executeEventListener('ws:message_sent', { message: the_message });
    } catch (e) {
        throw e;
    }
} 

export default{
    listenForMessage,
    sendMessage
}