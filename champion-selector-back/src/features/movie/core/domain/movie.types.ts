import { ChampionshipState } from "../../../../core/domain/championship/championship.types";
import { Winner } from "../../../../core/domain/championship/championship.entity.winner";

export class MovieChampionshipState extends ChampionshipState {
    context: string;
    genreWinner: Winner;
}

export enum MovieDomainEvents {
    TRANSITION_TO_MOVIE_CONTEXT = 'TRANSITION_TO_MOVIE_CONTEXT',
    SET_GENRE_WINNER = 'SET_GENRE_WINNER'
}

export enum MovieCommands {
    GENERATE_MOVIE_PARTICIPANTS = 'GENERATE_MOVIE_PARTICIPANTS'
}