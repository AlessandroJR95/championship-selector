import { IAggregate } from "../../../../core/modules/interfaces";
import { MovieEntity } from "./movie.entity";
import { Event } from "../../../../core/modules/event/event";
import { ChampionshipAggregate } from "../../../../core/domain/championship/championship.aggregate";
import { DomainEvent } from "../../../../core/modules/event/domain.event";
import { ChampionshipState, IRoundGenerator } from "../../../../core/domain/championship/championship.types";
import { genres } from "./movie.genres";
import { MovieChampionshipState, MovieDomainEvents } from "./movie.types";

export class MovieAggregate implements IAggregate<MovieEntity> {
    private championshipAggregate: ChampionshipAggregate;

    constructor(seed: string, initialState?: any, roundGenerator?: IRoundGenerator<MovieChampionshipState>) {
        this.championshipAggregate = new ChampionshipAggregate(seed, this.getInitialState(initialState), roundGenerator);
    }

    load(events: DomainEvent[]): MovieEntity {
        return new MovieEntity(this.getMovieState(events));
    }

    getInitialState(toMerge: any): MovieChampionshipState {
        return Object.assign({}, toMerge, {
            participants: genres,
            context: 'GENRE',
            genreWinner: null
        });
    }

    getMovieState(events: DomainEvent[]): MovieChampionshipState {
        const championshipState = this.championshipAggregate.getChampinshipState(events);

        return Object.assign(
            {},
            championshipState,
            events.reduce(this.reducer.bind(this), championshipState),
        ) as MovieChampionshipState;
    }

    reducer(state: ChampionshipState, event: Event) {
        switch(event.type) {
            case MovieDomainEvents.SET_GENRE_WINNER:
                return Object.assign({}, state, {
                    genreWinner: event.payload.winner
                });
            case MovieDomainEvents.TRANSITION_TO_MOVIE_CONTEXT:
                return Object.assign({}, state, {
                    context: 'MOVIE'
                });
            default:
                return state;
        }
    }
}