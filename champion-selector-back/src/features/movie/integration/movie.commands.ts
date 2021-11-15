import { MovieCommands } from "src/features/movie/domain/movie.types";
import { Command } from "src/modules/command/command";

export class GenerateMovieParticipants extends Command {
    constructor(entityID: any, roomID: any) {
        super(entityID, MovieCommands.GENERATE_MOVIE_PARTICIPANTS, { roomID });
    }
}
