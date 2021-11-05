import { MessageQueue } from "../message/message.queue";
import { IEventHandler } from "../interfaces";
import { Event } from "./event";

export class EventBus {
    private messageQueue: MessageQueue;

    constructor(messageQueue: MessageQueue) {
        this.messageQueue = messageQueue;
    }

    addHandler(event: any, handler: IEventHandler) {
        this.messageQueue.subscribeToTopic(event.name, (message) => {
            handler.handle(message as Event);
        });

        return this;
    }

    dispatch(event: Event) {
        this.messageQueue.dispatch(event.constructor.name, event);
    }
}