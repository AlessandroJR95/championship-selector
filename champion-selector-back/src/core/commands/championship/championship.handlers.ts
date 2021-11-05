import { ICommandHandler } from "../../modules/interfaces";
import { Command } from "../../modules/command/command";
import { ChampionshipRepository } from "../../domain/championship/championship.repository";
import { EventBus } from "../../modules/event/event.bus";
import { ChampionshipUpdated } from "../../events/championship/championship.events";
import { PermissionRepository } from "../../domain/permission/permission.repository";
import { RoomRepository } from "../../domain/room/room.repository";

export class AddParticipantHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.addParticipant(command.entityID, command.payload)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class RemoveParticipantHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.removeParticipant(command.entityID, command.payload.participantID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class AddJudgeHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;
    private permissionRepository: PermissionRepository;

    constructor(championshipRepository: ChampionshipRepository, permissionRepository: PermissionRepository) {
        this.championshipRepository = championshipRepository;
        this.permissionRepository = permissionRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        return this.championshipRepository.addJudge(command.entityID, command.payload.judge)
            .then(() => this.permissionRepository.assignJudgeToAToken(
                command.entityID,
                command.payload.judge.judgeID,
                command.payload.token
            ))
            .then(() => eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID)));
    }
}

export class RemoveJudgeHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.removeJudge(command.entityID, command.payload.judgeID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class SetJudgeReadyHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.setJudgeReady(command.entityID, command.payload.judgeID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class StartChampionshipHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.startChampionship(command.entityID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class VoteInParticipantHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.voteInParticipant(command.entityID, command.payload.judge.judgeID, command.payload.participant.participantID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class LikeParticipantHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.likeParticipant(command.entityID, command.payload.judge.judgeID, command.payload.participant.participantID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class RestartChampionshipHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;

    constructor(championshipRepository: ChampionshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        this.championshipRepository.restartChampionship(command.entityID)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class ValidateChampionshipHandler implements ICommandHandler {
    private roomRepository: RoomRepository;
    private championshipRepository: ChampionshipRepository;
    private permissionRepository: PermissionRepository;

    constructor(
        roomRepository: RoomRepository,
        championshipRepository: ChampionshipRepository,
        permissionRepository: PermissionRepository
    ) {
        this.roomRepository = roomRepository;
        this.championshipRepository = championshipRepository;
        this.permissionRepository = permissionRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        console.log(command);
        Promise.all([
            this.roomRepository.get(command.entityID),
            this.permissionRepository.get(command.entityID)
        ]).then(([ room, permission ]) => {
            return Promise.all([
                Promise.all(room.getClientsToDisconnect().map((client) => {
                    console.log('client disconnected: ', client);
                    return Promise.all([
                        this.roomRepository.disconnectClient(command.entityID, client.clientID),
                        this.championshipRepository.removeJudge(command.entityID, permission.getJudgeID(client.clientID)),
                        this.permissionRepository.removeToken(command.entityID, client.clientID),
                    ]);
                })),
            ]);
        }).then(() => {
            eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
        });
    }
}
