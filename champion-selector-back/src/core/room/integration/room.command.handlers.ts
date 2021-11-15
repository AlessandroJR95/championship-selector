import { ICommandHandler } from "src/modules/interfaces";
import { RoomRepository } from "src/core/room/domain/room.repository";
import { RoomClientKickEvent } from "src/core/room/integration/room.events";
import { EventBus } from "src/modules/event/event.bus";
import { Command } from "src/modules/command/command";
import { ChampionshipRepository } from "src/core/championship/domain/championship.repository";
import { PermissionRepository } from "src/core/permission/domain/permission.repository";

export class KickClientCommandHandler implements ICommandHandler {
    private roomRepository: RoomRepository;
    private championshipRepository: ChampionshipRepository;
    private permissionRepository: PermissionRepository;

    constructor(roomRepository: RoomRepository, championshipRepository: ChampionshipRepository, permissionRepository: PermissionRepository) {
        this.roomRepository = roomRepository;
        this.championshipRepository = championshipRepository;
        this.permissionRepository = permissionRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.permissionRepository.get(command.entityID)
            .then((permission) => this.championshipRepository.removeJudge(command.entityID, permission.getJudgeID(command.payload.clientID)))
            .then(() => this.roomRepository.kickClient(command.entityID, command.payload.clientID))
            .then(() => this.permissionRepository.removeToken(command.entityID, command.payload.clientID))
            .then(() => {
                eventBus.dispatch(new RoomClientKickEvent(command.entityID, command.payload.clientID));
            });
    }
}
