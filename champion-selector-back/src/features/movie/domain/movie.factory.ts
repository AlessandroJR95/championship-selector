import { IAggregateFactory } from "src/modules/interfaces";
import { MovieEntity } from "src/features/movie/domain/movie.entity";
import { MovieAggregate } from "src/features/movie/domain/movie.aggregate";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";

export class MovieChampionshipFactory implements IAggregateFactory<MovieEntity> {
    private roundGenerator: RoundGeneratorFactory;

    constructor(roundGenerator: RoundGeneratorFactory) {
        this.roundGenerator = roundGenerator;
    }

    create(entityID: string): MovieAggregate {
        return new MovieAggregate(entityID, null, this.roundGenerator.create(entityID));
    }
}