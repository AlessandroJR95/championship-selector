import { IEventHandler } from "../../modules/interfaces";
import { Event } from "../../modules/event/event";
import { RoomService } from "../../../services/room/room.service";

export class RoomKickEventHandler implements IEventHandler {
    private roomService: RoomService;

    constructor(roomService: RoomService) {
        this.roomService = roomService;
    }

    handle(event: Event) {
        this.roomService.kickClientFromCollection({ roomID: event.entityID, clientID: event.payload.clientID });
    }
    
}