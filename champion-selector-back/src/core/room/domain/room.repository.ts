import { EventStore } from "src/modules/store/event.store";
import { IEventSourcedRepository } from "src/modules/interfaces";
import { RoomEntity } from "src/core/room/domain/room.entity";
import { DomainEvent } from "src/modules/event/domain.event";
import { RoomAggregate } from "src/core/room/domain/room.aggregate";
import { RemoveClientEvent, AddClientEvent, DisconnectClientEvent, KickClientEvent } from "src/core/room/domain/room.domain.events";

export class RoomRepository implements IEventSourcedRepository<RoomEntity> {
    private eventStore: EventStore;
    
    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
    }

    getKEY(identifier: string): string {
        return `room/${identifier}`;
    }

    removeClient(entityID: string, clientID: string) {
        return this.save(entityID, new RemoveClientEvent(clientID, entityID));
    }

    addClient(entityID: string, clientID: string) {
        return this.save(entityID, new AddClientEvent(clientID));
    }

    disconnectClient(entityID: string, clientID: string) {
        return this.save(entityID, new DisconnectClientEvent(clientID, entityID));
    }

    kickClient(entityID: string, clientID: string) {
        return this.save(entityID, new KickClientEvent(entityID, clientID));
    }

    delete(entityID: string) {
        this.eventStore.delete(this.getKEY(entityID));
    }
    
    save(entityID: string, event: DomainEvent) {
        return this.eventStore.pushTo(this.getKEY(entityID), event);
    }

    get(entityID: string): Promise<RoomEntity> {
        return this.eventStore.getEvents(this.getKEY(entityID))
            .then((events) => Promise.resolve(new RoomAggregate().load(events)));
    }

    getEvents(entityID: string) {
        return this.eventStore.getEvents(this.getKEY(entityID));
    }

}