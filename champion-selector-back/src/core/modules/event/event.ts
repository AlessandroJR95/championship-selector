export class Event {
    type: string;
    entityID: string;
    payload: any;

    constructor(entityID: string, type: string, payload?: any) {
        this.entityID = entityID;
        this.type = type;
        this.payload = payload;
    }
}