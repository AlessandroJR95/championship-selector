import { IEventStoreFactory } from "../../../interfaces";
import { MockClient } from "./mock.client";

export class MockClientFactory implements IEventStoreFactory {
    create() {
        return new MockClient();
    }
}