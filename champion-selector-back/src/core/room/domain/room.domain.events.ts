import { RoomDomainEventTypes } from "src/core/room/domain/room.types";
import { DomainEvent } from "src/modules/event/domain.event";
import { getNOW } from "src/modules/utils/time";

export class AddClientEvent extends DomainEvent {
    constructor(clientID: string) {
        super(RoomDomainEventTypes.ADD_CLIENT, { clientID });
    }
}

export class RemoveClientEvent extends DomainEvent {
    constructor(clientID: string, roomID: string) {
        super(RoomDomainEventTypes.REMOVE_CLIENT, { ts: getNOW(), clientID, roomID });
    }
}

export class DisconnectClientEvent extends DomainEvent {
    constructor(clientID: string, roomID: string) {
        super(RoomDomainEventTypes.DISCONNECT_CLIENT, { roomID, clientID });
    }
}

export class KillRoomEvent extends DomainEvent {
    constructor(roomID: string) {
        super(RoomDomainEventTypes.KILL_ROOM, { roomID });
    }
}

export class KickClientEvent extends DomainEvent {
    constructor(roomID: string, clientID: string) {
        super(RoomDomainEventTypes.KICK_CLIENT, { roomID, clientID });
    }
}
