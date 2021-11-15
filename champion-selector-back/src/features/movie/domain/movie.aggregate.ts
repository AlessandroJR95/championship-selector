import { IAggregate } from "src/modules/interfaces";
import { MovieEntity } from "src/features/movie/domain/movie.entity";
import { Event } from "src/modules/event/event";
import { ChampionshipAggregate } from "src/core/championship/domain/championship.aggregate";
import { DomainEvent } from "src/modules/event/domain.event";
import { ChampionshipState, IRoundGenerator } from "src/core/championship/domain/championship.types";
import { genres } from "src/features/movie/domain/movie.genres";
import { MovieChampionshipState, MovieDomainEvents } from "src/features/movie/domain/movie.types";

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