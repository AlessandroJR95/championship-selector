import { IAggregateFactory } from "src/modules/interfaces";
import { ChampionshipAggregate } from "src/core/championship/domain/championship.aggregate";
import { ChampionshipEntity } from "src/core/championship/domain/championship.entity";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";

export class ChampionshipAggregateFactory implements IAggregateFactory<ChampionshipEntity> {
    private roundGenerator: RoundGeneratorFactory;

    constructor(roundGenerator: RoundGeneratorFactory) {
        this.roundGenerator = roundGenerator;
    }

    create(entityID: string): ChampionshipAggregate {
        return new ChampionshipAggregate(entityID, null, this.roundGenerator.create(entityID));
    }
}