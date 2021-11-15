import { RedisClient } from "./redis.client";
import { IEventStoreFactory } from "../../../interfaces";

export class RedisClientFactory implements IEventStoreFactory{
    create() {
        return new RedisClient();
    }
}