import { RoomRepository } from "src/core/room/domain/room.repository";
import { EventStore } from "src/modules/store/event.store";
import { EventStoreFactory } from "src/modules/store/event.store.factory";
import { MockClientFactory } from "src/modules/store/clients/mock/mock.factory";
import * as time from "src/modules/utils/time";

describe("Championship tests", () => {
    let roomRepository: RoomRepository;

    beforeEach(() => {
        const eventFactory = new EventStoreFactory(new MockClientFactory());
        const eventStore = new EventStore(eventFactory);
        roomRepository = new RoomRepository(eventStore);
    });

    it("should add client to room", async () => {
        const roomID = 'ale';
        const clientID = '1';

        await roomRepository.addClient(roomID, clientID);

        const room = await roomRepository.get(roomID);

        expect(room.hasClient(clientID)).toEqual(true);
    });

    it("should remove client to room", async () => {
        const roomID = 'ale';
        const clientID = '1';

        await roomRepository.addClient(roomID, clientID);

        let room = await roomRepository.get(roomID);

        await roomRepository.removeClient(roomID, clientID);

        room = await roomRepository.get(roomID);

        expect(room.hasClient(clientID)).toEqual(false);
    });

    it("should get clients list to disconnect after timeout", async () => {
        const roomID = 'ale';
        const clientID = '1';
        const timeState = { time: 0 };

        const getNowStub = jest.spyOn(time, 'getNOW').mockImplementation(() => {
            return timeState.time;
        });

        await roomRepository.addClient(roomID, clientID);

        let room = await roomRepository.get(roomID);

        await roomRepository.removeClient(roomID, clientID);

        timeState.time = 50000;

        room = await roomRepository.get(roomID);

        expect(room.getClientsToDisconnect().length).toEqual(1);

        getNowStub.mockRestore();
    });
});
