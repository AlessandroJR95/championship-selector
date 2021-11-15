import { from } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { RoomCollection } from "src/core/room/integration/room.collection";
import { RoomRepository } from "src/core/room/domain/room.repository";
import { PermissionRepository } from "src/core/permission/domain/permission.repository";
import { CommandBus } from "src/modules/command/command.bus";
import { ValidateChampionshipCommand } from "src/core/championship/integration/championship.commands";
import { RoomEntity } from "src/core/room/domain/room.entity";
import { ChampionshipRepository } from "src/core/championship/domain/championship.repository";
import { KickClientCommand } from "src/core/room/integration/room.commands";

export class RoomService {
    private roomCollection: RoomCollection;
    private roomRepository: RoomRepository;
    private permissionRepository: PermissionRepository;
    private championshipRepository: ChampionshipRepository;
    private commandBus: CommandBus;

    constructor(
        roomRepository: RoomRepository, 
        roomCollection: RoomCollection, 
        permissionRepository: PermissionRepository,
        championshipRepository: ChampionshipRepository,
        commandBus: CommandBus
    ) {
        this.roomCollection = roomCollection;
        this.roomRepository = roomRepository;
        this.permissionRepository = permissionRepository;
        this.championshipRepository = championshipRepository;
        this.commandBus = commandBus;

        const bus = this.roomCollection.getBus();

        bus.onConnection().subscribe(
            ({ roomID, clientID }: any) => {
                this.roomRepository.addClient(roomID, clientID);
            }
        );

        bus.onDisconnection().subscribe(
            ({ roomID, clientID }: any) => {
                this.roomRepository.removeClient(roomID, clientID);
            }
        );

        bus.onPing().pipe(
            switchMap(({ roomID }: any) => 
                from(this.roomRepository.get(roomID)).pipe(
                    map((room: RoomEntity) => ({ roomID, isEmpty: room.isEmpty() })
                )
            ))
        ).subscribe(
            ({ roomID, isEmpty }: any) => {
                this.updateRoom({ roomID });

                if (isEmpty) {
                    this.killRoom({ roomID });
                } else {
                    this.commandBus.dispatch(new ValidateChampionshipCommand(roomID));
                }
            }
        );
    }

    async subscribeToRoom({
        roomID,
        clientID,
        update,
        observable,
        prepare
    }: any) {
        prepare && prepare();

        return this.roomCollection.get(roomID).subscribe(
            clientID,
            update,
            observable.next,
            observable.error,
            observable.complete
        );
    }

    async updateRoom({ roomID }: any) {
        this.roomCollection.get(roomID).updateRoom();
    }

    async killRoom({ roomID }: any) {
        console.log('Room killed: ', roomID);
        this.roomCollection.delete(roomID);
        this.roomRepository.delete(roomID);
        this.permissionRepository.delete(roomID);
        this.championshipRepository.delete(roomID);
    }

    async kickClientFromCollection({ roomID, clientID }: any) {
        return this.roomCollection.kick(roomID, clientID);
    }

    async kickClient({ roomID, judgeID, token }: any) {
        const permission = await this.permissionRepository.get(roomID);

        if (!permission.hasOwnerPermission(token)) {
            throw new Error("Cant kick judge: isnt the owner");
        }

        const clientID = permission.getJudgeToken(judgeID);

        if (permission.hasOwnerPermission(clientID)) {
            throw new Error("Cant kick yourself");
        }

        this.commandBus.dispatch(new KickClientCommand(roomID, clientID));

        return {
            roomID,
            clientID
        }
    }
}