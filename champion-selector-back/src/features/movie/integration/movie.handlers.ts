import { MovieRepository } from "src/features/movie/domain/movie.repository";
import { ICommandHandler } from "src/modules/interfaces";
import { Command } from "src/modules/command/command";
import { EventBus } from "src/modules/event/event.bus";
import { ChampionshipUpdated } from "src/core/championship/integration/championship.events";
import { ChampionshipRepository } from "src/core/championship/domain/championship.repository";
import { Participant } from "src/core/championship/domain/championship.types";
import { MovieData } from "src/features/movie/domain/movie.data";

export class GenerateMovieParticipantsHandler implements ICommandHandler {
    private movieRepository: MovieRepository;
    private championshipRepository: ChampionshipRepository;
    private movieData: MovieData;

    constructor(
        movieRepository: MovieRepository,
        championshipRepository: ChampionshipRepository,
        movieData: MovieData
    ) {
        this.movieRepository = movieRepository;
        this.championshipRepository = championshipRepository;
        this.movieData = movieData;
    }

    handle(command: Command, eventBus: EventBus) {
        return this.movieRepository.get(command.entityID)
            .then((championship) => {
                return this.movieRepository.setGenreWinner(command.entityID, championship.getGenreWinner())
                    .then(() => this.championshipRepository.restartChampionship(command.entityID))
                    .then(() => this.movieData.getFromGenre(championship.getGenreWinner()))
            })
            .then((participants) => Promise.all(
                participants.map((participant: Participant) => this.championshipRepository.addParticipant(command.entityID, participant))
            ))
            .then(() => this.movieRepository.transitionToMovieContext(command.entityID))
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}