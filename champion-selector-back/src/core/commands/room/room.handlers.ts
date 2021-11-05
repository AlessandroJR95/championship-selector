import { ICommandHandler } from "../../modules/interfaces";
import { RoomRepository } from "../../domain/room/room.repository";
import { RoomClientKickEvent } from "../../events/room/room.events";
import { EventBus } from "../../modules/event/event.bus";
import { Command } from "../../modules/command/command";
import { ChampionshipRepository } from "../../domain/championship/championship.repository";
import { PermissionRepository } from "../../domain/permission/permission.repository";

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
