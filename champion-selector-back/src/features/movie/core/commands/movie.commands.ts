import { MovieCommands } from "../domain/movie.types";
import { Command } from "../../../../core/modules/command/command";

export class GenerateMovieParticipants extends Command {
    constructor(entityID: any, roomID: any) {
        super(entityID, MovieCommands.GENERATE_MOVIE_PARTICIPANTS, { roomID });
    }
}
