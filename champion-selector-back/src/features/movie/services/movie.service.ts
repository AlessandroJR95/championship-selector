import { PermissionRepository } from "../../../core/domain/permission/permission.repository";
import { CommandBus } from "../../../core/modules/command/command.bus";
import { GenerateMovieParticipants } from "../core/commands/movie.commands";

export class MovieService {
    private permissionRepository: PermissionRepository;
    private commandBus: CommandBus;

    constructor(
        commandBus: CommandBus,
        permissionRepository: PermissionRepository,
    ) {
        this.permissionRepository = permissionRepository;
        this.commandBus = commandBus;
    }

    async prepareChampionship({ championshipID }: any) {
        this.commandBus.dispatch(new GenerateMovieParticipants(championshipID, championshipID));

        return {
            championshipID
        };
    }

    async rerollMovieList({ championshipID, token }: any) {
        const permission = await this.permissionRepository.get(championshipID);

        if (!permission.hasOwnerPermission(token)) {
            throw new Error('Cant reroll movie options: you isnt the owner');
        }

        this.commandBus.dispatch(new GenerateMovieParticipants(championshipID, championshipID));

        return {
            championshipID
        }
    }
}