import { DomainEvent } from "src/modules/event/domain.event";
import { MovieDomainEvents } from "src/features/movie/domain/movie.types";
import { Winner } from "src/core/championship/domain/championship.entity.winner";

export class TransitionToMovieContext extends DomainEvent {
    constructor() {
        super(MovieDomainEvents.TRANSITION_TO_MOVIE_CONTEXT);
    }
}

export class SetGenreWinner extends DomainEvent {
    constructor(winner: Winner) {
        super(MovieDomainEvents.SET_GENRE_WINNER, { winner });
    }
}

