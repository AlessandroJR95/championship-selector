import { MovieRepository } from "../domain/movie.repository";
import { ICommandHandler } from "../../../../core/modules/interfaces";
import { Command } from "../../../../core/modules/command/command";
import { EventBus } from "../../../../core/modules/event/event.bus";
import { ChampionshipUpdated } from "../../../../core/events/championship/championship.events";
import { ChampionshipRepository } from "../../../../core/domain/championship/championship.repository";
import { Participant } from "../../../../core/domain/championship/championship.types";
import { MovieData } from "../domain/movie.data";

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