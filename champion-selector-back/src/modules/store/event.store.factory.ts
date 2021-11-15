import { IEventStoreFactory } from "../interfaces";

export class EventStoreFactory {
    private factories: Map<string, IEventStoreFactory>;

    constructor(defaultFactory: IEventStoreFactory) {
        this.factories = new Map([['default', defaultFactory]]);
    }

    create(factoryID: string) {
        if (this.factories.has(factoryID)) {
            return this.factories.get(factoryID).create();
        }

        return this.factories.get('default').create();
    }

    add(factoryID: string, factory: IEventStoreFactory) {
        this.factories.set(factoryID, factory);
        return this;
    }
}