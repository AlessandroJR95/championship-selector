import { IMessageFactory } from "../interfaces";

export class MessageFactory {
    private factories: Map<string, IMessageFactory>;

    constructor(defaultFactory: IMessageFactory) {
        this.factories = new Map([['default', defaultFactory]]);
    }

    create(factoryID: string) {
        if (this.factories.has(factoryID)) {
            return this.factories.get(factoryID).create();
        }

        return this.factories.get('default').create();
    }

    add(factoryID: string, factory: IMessageFactory) {
        this.factories.set(factoryID, factory);
        return this;
    }
}