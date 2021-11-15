export enum RoomDomainEventTypes {
    ADD_CLIENT = 'ADD_CLIENT',
    REMOVE_CLIENT = 'REMOVE_CLIENT',
    DISCONNECT_CLIENT = 'DISCONNECT_CLIENT',
    KILL_ROOM = 'KILL_ROOM',
    KICK_CLIENT = 'KICK_CLIENT',
    REMOVE_ALL_CLIENTS = 'REMOVE_ALL_CLIENTS'
}

export class Client {
    clientID: string;
}

export class RoomState {
    clients: Client[];
    clientsToRemove: Client[];
    clientsToDisconnect: Client[];
    empty: boolean;

    constructor() {
        this.clients = [];
        this.clientsToRemove = [];
        this.clientsToDisconnect = [];
        this.empty = true;
    }
}