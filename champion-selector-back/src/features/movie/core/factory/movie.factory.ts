import { IAggregateFactory } from "../../../../core/modules/interfaces";
import { MovieEntity } from "../domain/movie.entity";
import { MovieAggregate } from "../domain/movie.aggregate";
import { RoundGeneratorFactory } from "../../../../core/factories/round.generator.factory";

export class MovieChampionshipFactory implements IAggregateFactory<MovieEntity> {
    private roundGenerator: RoundGeneratorFactory;

    constructor(roundGenerator: RoundGeneratorFactory) {
        this.roundGenerator = roundGenerator;
    }

    create(entityID: string): MovieAggregate {
        return new MovieAggregate(entityID, null, this.roundGenerator.create(entityID));
    }
}