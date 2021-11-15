import { IAggregate } from "src/modules/interfaces";
import { ChampionshipAggregate } from "src/core/championship/domain/championship.aggregate";
import { ChampionshipEntity } from "src/core/championship/domain/championship.entity";
import { ChampionshipDomainEventType } from "src/core/championship/domain/championship.types";
import { DomainEvent } from "src/modules/event/domain.event";
import { ChampionshipState, IRoundGenerator } from "src/core/championship/domain/championship.types";
import { QuizEntity } from "src/features/quiz/domain/quiz.entity";
import { QuizDomainEvents, QuizChampionshipState } from "src/features/quiz/domain/quiz.types";

export class QuizAggregate implements IAggregate<QuizEntity> {
    private championshipAggregate: ChampionshipAggregate;

    constructor(seed: string, initialState?: any, roundGenerator?: IRoundGenerator<QuizChampionshipState>) {
        this.championshipAggregate = new ChampionshipAggregate(seed, this.getInitialState(initialState), roundGenerator);
    }

    load(events: DomainEvent[]): QuizEntity {
        return new QuizEntity(this.getQuizState(events));
    }

    getInitialState(toMerge: any): ChampionshipState {
        return toMerge;
    }

    getQuizState(events: DomainEvent[]): QuizChampionshipState {
        return this.championshipAggregate
            .reduceCompose(
                events,
                (reducer: any) => (s: any, event: any) => {
                    let evt = event;

                    if (event.type === ChampionshipDomainEventType.RESTART_CHAMPIONSHIP) {
                        evt = {};
                    }

                    return reducer(this.reducer(s, event), evt);
                }
            ) as QuizChampionshipState;
    }

    reducer(state: QuizChampionshipState, event: DomainEvent) {
        switch(event.type) {
            case ChampionshipDomainEventType.RESTART_CHAMPIONSHIP:
                return this.championshipAggregate.getInitialState({ judges: ChampionshipEntity.getUnreadyJudges(state), multiple: state.multiple });
            case QuizDomainEvents.SET_QUESTIONS:
                return Object.assign({}, state, { 
                    questions: QuizEntity.alternateQuestions(state, event.payload)
                });
            case QuizDomainEvents.SET_MULTIPLE_QUIZ:
                return Object.assign({}, state, { 
                    multiple: event.payload
                });
            default:
                return state;
        }
    }
}