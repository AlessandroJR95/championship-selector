import { IAggregateFactory } from "../../../../core/modules/interfaces";
import { QuizEntity } from "../domain/quiz.entity";
import { QuizAggregate } from "../domain/quiz.aggregate";
import { RoundGeneratorFactory } from "../../../../core/factories/round.generator.factory";

export class QuizChampionshipFactory implements IAggregateFactory<QuizEntity> {
    private roundGenerator: RoundGeneratorFactory;

    constructor(roundGenerator: RoundGeneratorFactory) {
        this.roundGenerator = roundGenerator;
    }

    create(entityID: string): QuizAggregate {
        return new QuizAggregate(entityID, null, this.roundGenerator.create(entityID));
    }
}