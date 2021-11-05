import { IAggregate } from "../../../../core/modules/interfaces";
import { ChampionshipAggregate } from "../../../../core/domain/championship/championship.aggregate";
import { ChampionshipEntity } from "../../../../core/domain/championship/championship.entity";
import { ChampionshipDomainEventType } from "../../../../core/domain/championship/championship.types";
import { DomainEvent } from "../../../../core/modules/event/domain.event";
import { ChampionshipState, IRoundGenerator } from "../../../../core/domain/championship/championship.types";
import { QuizEntity } from "./quiz.entity";
import { QuizDomainEvents, QuizChampionshipState } from "./quiz.types";

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