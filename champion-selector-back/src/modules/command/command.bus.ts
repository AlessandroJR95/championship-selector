import { MessageQueue } from "../message/message.queue";
import { ICommandHandler } from "../interfaces";
import { Command } from "./command";
import { EventBus } from "../event/event.bus";

export class CommandBus {
    private messageQueue: MessageQueue;
    private eventBus: EventBus;

    constructor(messageQueue: MessageQueue, eventBus: EventBus) {
        this.messageQueue = messageQueue;
        this.eventBus = eventBus;
    }

    addHandler(command: any, handler: ICommandHandler) {
        this.messageQueue.subscribeToQueue(command.name, (message) => {
            handler.handle(message as Command, this.eventBus);
        });

        return this;
    }

    addRPCHandler(command: any, handler: ICommandHandler) {
        this.messageQueue.subscribeToRPC(command.name, (message) => handler.handle(message as Command, this.eventBus));

        return this;
    }

    dispatchRPC(command: Command) {
        return this.messageQueue.publishRPC(command.constructor.name, command);
    }

    dispatch(command: Command) {
        this.messageQueue.publish(command.constructor.name, command);
    }
}