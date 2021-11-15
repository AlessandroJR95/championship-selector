import { IAggregateFactory } from "src/modules/interfaces";
import { QuizEntity } from "src/features/quiz/domain/quiz.entity";
import { QuizAggregate } from "src/features/quiz/domain/quiz.aggregate";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";

export class QuizChampionshipFactory implements IAggregateFactory<QuizEntity> {
    private roundGenerator: RoundGeneratorFactory;

    constructor(roundGenerator: RoundGeneratorFactory) {
        this.roundGenerator = roundGenerator;
    }

    create(entityID: string): QuizAggregate {
        return new QuizAggregate(entityID, null, this.roundGenerator.create(entityID));
    }
}