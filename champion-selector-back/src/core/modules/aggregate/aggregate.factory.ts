import { IAggregateFactory } from "../interfaces";

export class AggregateFactory {
    private factories: Map<string, IAggregateFactory<any>>;

    constructor(defaultFactory: IAggregateFactory<any>) {
        this.factories = new Map([['default', defaultFactory]]);
    }

    private getType(entityID: string) {
        return entityID.split(':')[1];
    }

    create(entityID: string) {
        if (this.factories.has(this.getType(entityID))) {
            return this.factories.get(this.getType(entityID)).create(entityID);
        }

        return this.factories.get('default').create(entityID);
    }

    add(factoryID: string, factory: IAggregateFactory<any>) {
        this.factories.set(factoryID, factory);
        return this;
    }
}