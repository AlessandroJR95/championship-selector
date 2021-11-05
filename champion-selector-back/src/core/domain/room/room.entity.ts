import { RoomState, Client } from "./room.types";

export class RoomEntity {
    private state: RoomState;

    constructor(state: RoomState) {
        this.state = state;
    }

    hasClient(clientID: string): boolean {
        return this.state.clients.some((client) => client.clientID === clientID);
    }

    getClients(): Client[] {
        return this.state.clients;
    }

    getClientsToRemove(): Client[] {
        return this.state.clientsToRemove;
    }

    getClientsToDisconnect(): Client[] {
        return this.state.clientsToDisconnect;
    }

    isEmpty(): boolean {
        return this.state.empty;
    }
}