import { IStoreClient } from "../interfaces";
import { EventStoreFactory } from "./event.store.factory";
import { DomainEvent } from "../event/domain.event";

export class EventStore {
    private client: IStoreClient;
    private EVENT_SEPARATOR = '-&-&-';

    constructor(factory: EventStoreFactory) {
        this.client = factory.create(process.env.EVENT_STORE_CLIENT);
    }

    pushTo(id: string, event: DomainEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.append(id, `${JSON.stringify(event)}${this.EVENT_SEPARATOR}`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    getEvents(id: string): Promise<DomainEvent[]> {
        return new Promise((resolve, reject) => {
            this.client.get(id, (err, data) => {
                if (err) return reject(err);

                try {
                    resolve(data ? data.split(this.EVENT_SEPARATOR).reduce((acc, item) => item ? acc.concat(JSON.parse(item)) : acc, []) : []);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    delete(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.del(id, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}
