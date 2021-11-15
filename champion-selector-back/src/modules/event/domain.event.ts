export class DomainEvent {
    type: string;
    payload: any;

    constructor(type: string, payload?: any) {
        this.type = type;
        this.payload = payload;
    }
}