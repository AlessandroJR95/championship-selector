import { IEventHandler } from "../../modules/interfaces";
import { Event } from "../../modules/event/event";
import { RoomService } from "../../../services/room/room.service";

export class ChampioshipUpdatedHandler implements IEventHandler {
    private roomService: RoomService;

    constructor(roomService: RoomService) {
        this.roomService = roomService;
    }

    handle(event: Event) {
        this.roomService.updateRoom({ roomID: event.payload.roomID });
    }
    
}