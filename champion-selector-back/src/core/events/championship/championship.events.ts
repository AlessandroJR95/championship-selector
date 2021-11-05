import { Event } from "../../modules/event/event";

export class ChampionshipUpdated extends Event {
    constructor(entityID: string, roomID: string) {
        super(entityID, 'CHAMPIONSHIP_UPDATED', { roomID });
    }
}