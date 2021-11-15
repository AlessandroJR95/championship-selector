import { EventStore } from "src/modules/store/event.store";
import { IEventSourcedRepository } from "src/modules/interfaces";
import { QuizEntity } from "src/features/quiz/domain/quiz.entity";
import { DomainEvent } from "src/modules/event/domain.event";
import { QuizAggregate } from "src/features/quiz/domain/quiz.aggregate";
import { SetMultipleQuiz, SetQuestions } from "src/features/quiz/domain/quiz.domain.events";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";
import { Question } from "src/features/quiz/domain/quiz.types";

export class QuizRepository implements IEventSourcedRepository<QuizEntity> {
    private eventStore: EventStore;
    private roundGenerator: RoundGeneratorFactory;
    
    constructor(eventStore: EventStore, roundGenerator: RoundGeneratorFactory) {
        this.eventStore = eventStore;
        this.roundGenerator = roundGenerator;
    }

    getKEY(identifier: string): string {
        return `championship/${identifier}`;
    }

    setQuestions(entityID: string, question: Question[]) {
        return this.save(entityID, new SetQuestions(question));
    }

    setMultipleQuiz(entityID: string, canHaveMultipleQuiz: boolean) {
        return this.save(entityID, new SetMultipleQuiz(canHaveMultipleQuiz));
    }

    delete(entityID: string) {
        return this.eventStore.delete(entityID);
    }

    save(entityID: string, event: DomainEvent) {
        return this.eventStore.pushTo(this.getKEY(entityID), event);
    }

    get(entityID: string): Promise<QuizEntity> {
        return this.eventStore.getEvents(this.getKEY(entityID))
            .then((events) => Promise.resolve(new QuizAggregate(entityID, null, this.roundGenerator.create(entityID)).load(events)));
    }
}