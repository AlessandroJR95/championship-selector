import { IMessageClient } from "../../../interfaces";

export class MockMessageClient implements IMessageClient {
    private listeners: Map<string, (data: any) => void>;

    constructor() {
        this.listeners = new Map();
    }

    publish(queue: string, message: any) {
        if (this.listeners.has(queue)) {
            this.listeners.get(queue)(message);
        }
    }

    dispatch(channel: string, message: any) {
        if (this.listeners.has(channel)) {
            this.listeners.get(channel)(message);
        }
    }

    publishToRPC(queue: string, message: any) {
        if (this.listeners.has(queue)) {
            return Promise.resolve(this.listeners.get(queue)(message));
        }

        return Promise.reject();
    }

    subscribeToRPC(queue: string, callback: (msg: any) => void) {
        this.listeners.set(queue, callback);
    }

    subscribeToQueue(queue: string, callback: (msg: any) => void) {
        this.listeners.set(queue, callback);
    }

    subscribeToTopic(channel: string, callback: (msg: any) => void) {
        this.listeners.set(channel, callback);
    }
}