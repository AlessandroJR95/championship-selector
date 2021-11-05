import { Event } from "../../modules/event/event";

export class RoomClientKickEvent extends Event {
    constructor(entityID: string, clientID: string) {
        super(entityID, 'ROOM_CLIENT_KICK', { clientID });
    }
}