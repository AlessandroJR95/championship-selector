import * as redis from 'redis';
import { IStoreClient } from '../../../interfaces';

export class RedisClient implements IStoreClient {
    private client: redis.RedisClient;

    constructor() {
        this.client = redis.createClient({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT, 10),
            password: process.env.REDIS_PASS
        });

        this.client.on('error', (error) => {
            console.error(error);
        });
    }
    
    getClient() {
        return this.client;
    }

    append(key: string, data: string, cb: (err: Error) => void) {
        this.client.append(key, data, cb);
    }

    del(key: string, cb: (err: Error) => void) {
        this.client.del(key, cb);
    }

    get(key: string, cb: (err: Error, data: string) => void) {
        this.client.get(key, cb);
    }

    set(key: string, data: string, cb: (err: Error) => void) {
        this.client.set(key, data, cb);
    }

    keys(query: string, cb: (err: Error, keys: unknown) => void) {
        this.client.keys(query, cb);
    }
}
