import { IEventHandler } from "src/modules/interfaces";
import { Event } from "src/modules/event/event";
import { RoomService } from "src/core/room/integration/room.service";

export class ChampioshipUpdatedHandler implements IEventHandler {
    private roomService: RoomService;

    constructor(roomService: RoomService) {
        this.roomService = roomService;
    }

    handle(event: Event) {
        this.roomService.updateRoom({ roomID: event.payload.roomID });
    }
    
}