import { IRoundGenerator } from '../domain/championship/championship.types';

export class RoundGeneratorFactory {
    private factories: Map<string, IRoundGenerator<any>>;

    constructor(defaultFactory: IRoundGenerator<any>) {
        this.factories = new Map([['default', defaultFactory]]);
    }

    getStrategy(entityID: string): string {
        return entityID.split(':')[2];
    }

    add(factoryID: string, factoryClass: IRoundGenerator<any>) {
        this.factories.set(factoryID, factoryClass);
    }

    create(entityID: string): IRoundGenerator<any> {
        if (this.factories.has(this.getStrategy(entityID))) {
            return this.factories.get(this.getStrategy(entityID)).create();
        }

        return this.factories.get('default').create();
    }
}