import { RoomRepository } from "../../core/domain/room/room.repository";
import { EventStoreFactory } from "../../core/modules/store/event.store.factory";
import { MockClientFactory } from "../../core/modules/store/clients/mock/mock.factory";
import { EventStore } from "../../core/modules/store/event.store";
import { RoomCollection } from './room.collection';
import { RoomService } from './room.service';
import { PermissionRepository } from "../../core/domain/permission/permission.repository";
import { ChampionshipRepository } from "../../core/domain/championship/championship.repository";
import { CommandBus } from "../../core/modules/command/command.bus";
import { MessageFactory } from "../../core/modules/message/message.factory";
import { MockMessageFactory } from "../../core/modules/message/clients/mock/mock.factory";
import { MessageQueue } from "../../core/modules/message/message.queue";
import { EventBus } from "../../core/modules/event/event.bus";
import { KickClientCommand } from "../../core/commands/room/room.commands";
import { KickClientCommandHandler } from "../../core/commands/room/room.handlers";
import { RoomClientKickEvent } from "../../core/events/room/room.events";
import { RoomKickEventHandler } from "../../core/events/room/room.handlers";
import { Subject } from "rxjs";
import { take } from "rxjs/operators";
import { ChampionshipService } from "../championship/championship.service";
import { AddJudgeCommand } from "../../core/commands/championship/championship.commands";
import { AddJudgeHandler } from "../../core/commands/championship/championship.handlers";
import { RoundGeneratorFactory } from "../../core/factories/round.generator.factory";
import { RoundGeneratorClassic } from "../../core/domain/round/round.generator.classic";
import { ChampionshipAggregateFactory } from "../../core/factories/championship.factory";
import { AggregateFactory } from "../../core/modules/aggregate/aggregate.factory";

describe("RoomService tests", () => {
    let roomService: RoomService;
    let roomRepository: RoomRepository;
    let roomCollection: RoomCollection;
    let championshipService: ChampionshipService;

    beforeEach(() => {
        const eventFactory = new EventStoreFactory(new MockClientFactory());
        const messageFactory = new MessageFactory(new MockMessageFactory());

        const eventStore = new EventStore(eventFactory);
        const messageQueue = new MessageQueue(messageFactory);

        const eventBus = new EventBus(messageQueue);
        const commandBus = new CommandBus(messageQueue, eventBus);

        roomCollection = new RoomCollection();
        roomRepository = new RoomRepository(eventStore);

        const permissionRepository = new PermissionRepository(eventStore);
        const roundGenerator = new RoundGeneratorFactory(new RoundGeneratorClassic());
        const aggregateFactory = new AggregateFactory(new ChampionshipAggregateFactory(roundGenerator));
        const championshipRepository = new ChampionshipRepository(aggregateFactory, eventStore);

        commandBus
            .addHandler(KickClientCommand, new KickClientCommandHandler(roomRepository, championshipRepository, permissionRepository))
            .addHandler(AddJudgeCommand, new AddJudgeHandler(championshipRepository, permissionRepository));

        roomService = new RoomService(roomRepository, roomCollection, permissionRepository, championshipRepository, commandBus);
        championshipService = new ChampionshipService(championshipRepository, permissionRepository, commandBus);

        eventBus.addHandler(RoomClientKickEvent, new RoomKickEventHandler(roomService));
    });

    afterEach(() => {
        roomCollection.deleteAll();
    });

    it('should subscribe to room and get update', async (done) => {
        const clientID = 'clientID';
        const state = { updated: false };
        
        const sub = new Subject();

        sub.pipe(take(2)).subscribe((data: any) => {
            if (data.updated) {
                expect(data.updated).toEqual(true);
                done();
            }
        });

        await roomService.subscribeToRoom({
            roomID: clientID,
            clientID,
            update: () => Promise.resolve(state),
            observable: {
                next: sub.next.bind(sub),
                error: sub.error.bind(sub),
                complete: sub.complete.bind(sub)
            }
        });

        state.updated = true;

        await roomService.updateRoom({
            roomID: clientID
        });
    });

    it('should kick client', async (done) => {
        const championship = await championshipService.createChampionship();
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' } });
        
        const sub = new Subject();

        sub.subscribe(
            () => {},
            (err) => {
                expect(err.message).toEqual('You got kicked');
                done();
            }
        );

        await roomService.subscribeToRoom({
            roomID: championship.championshipID,
            clientID: user.token,
            update: () => Promise.resolve({ teste: 1 }),
            observable: {
                next: sub.next.bind(sub),
                error: sub.error.bind(sub),
                complete: sub.complete.bind(sub)
            }
        });

        await roomService.subscribeToRoom({
            roomID: championship.championshipID,
            clientID: championship.token,
            update: () => Promise.resolve({ teste: 2 }),
            observable: {
                next: sub.next.bind(sub),
                error: sub.error.bind(sub),
                complete: sub.complete.bind(sub)
            }
        });

        try {
            await roomService.kickClient({
                roomID: championship.championshipID,
                judgeID: user.judgeID,
                token: user.token
            });
        } catch (e) {
            expect(e.message).toEqual('Cant kick judge: isnt the owner');
        }

        await roomService.kickClient({
            roomID: championship.championshipID,
            judgeID: user.judgeID,
            token: championship.token
        });

    });
});