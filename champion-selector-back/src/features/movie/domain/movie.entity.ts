import { ChampionshipEntity } from "src/core/championship/domain/championship.entity";
import { MovieChampionshipState } from "src/features/movie/domain/movie.types";

export class MovieEntity extends ChampionshipEntity {
    protected state: MovieChampionshipState;

    constructor(state: MovieChampionshipState) {
        super(state);
    }

    getState() {
        return {
            phase: this.state.phase,
            judges: this.state.judges,
            participants: this.state.participants,
            round: this.state.round,
            rounds: this.state.rounds,
            votes: this.state.votes,
            winners: this.state.winners,
            context: this.state.context,
            generator: this.state.generator,
            score: this.state.score,
            likes: this.state.likes
        };
    }

    getGenreWinner() {
        return this.state.genreWinner || this.getWinner();
    }

}