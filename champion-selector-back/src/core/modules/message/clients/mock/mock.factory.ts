import { IMessageFactory } from "../../../interfaces";
import { MockMessageClient } from "./mock.client";

export class MockMessageFactory implements IMessageFactory {
    create() {
        return new MockMessageClient();
    }
}