import { DomainEvent } from "../../../../core/modules/event/domain.event";
import { MovieDomainEvents } from "./movie.types";
import { Winner } from "../../../../core/domain/championship/championship.entity.winner";

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

