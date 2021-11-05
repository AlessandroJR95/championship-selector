import { IAggregateFactory } from "../modules/interfaces";
import { ChampionshipAggregate } from "../domain/championship/championship.aggregate";
import { ChampionshipEntity } from "../domain/championship/championship.entity";
import { RoundGeneratorFactory } from "./round.generator.factory";

export class ChampionshipAggregateFactory implements IAggregateFactory<ChampionshipEntity> {
    private roundGenerator: RoundGeneratorFactory;

    constructor(roundGenerator: RoundGeneratorFactory) {
        this.roundGenerator = roundGenerator;
    }

    create(entityID: string): ChampionshipAggregate {
        return new ChampionshipAggregate(entityID, null, this.roundGenerator.create(entityID));
    }
}