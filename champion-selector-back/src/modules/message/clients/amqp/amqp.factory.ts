import { IMessageFactory } from "../../../interfaces";
import { AmqpClient } from "./amqp.client";

export class AmqpFactory implements IMessageFactory {
    create() {
        return new AmqpClient();
    }
}