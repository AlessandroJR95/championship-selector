import { IMessageClient } from '../interfaces';
import { MessageFactory } from './message.factory';

export class MessageQueue {
    private client: IMessageClient;

    constructor(factory: MessageFactory) {
        this.client = factory.create(process.env.MESSAGE_CLIENT);
    }

    publish(queue: string, message: unknown) {
        this.client.publish(queue, message);
    }

    publishRPC(queue: string, message: unknown) {
        return this.client.publishToRPC(queue, message);
    }

    dispatch(channel: string, message: unknown) {
        this.client.dispatch(channel, message);
    }

    subscribeToQueue(queue: string, callback: (msg: unknown) => void) {
        this.client.subscribeToQueue(queue, callback);
    }

    subscribeToTopic(channel: string, callback: (msg: unknown) => void) {
        this.client.subscribeToTopic(channel, callback);
    }

    subscribeToRPC(queue: string, callback: (msg: unknown) => void) {
        this.client.subscribeToRPC(queue, callback);
    }
}