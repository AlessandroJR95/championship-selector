import { IAggregate } from "src/modules/interfaces";
import { RoomEntity } from "src/core/room/domain/room.entity";
import { DomainEvent } from "src/modules/event/domain.event";
import { RoomState, RoomDomainEventTypes, Client } from "src/core/room/domain/room.types";
import { getNOW } from "src/modules/utils/time";

export class RoomAggregate implements IAggregate<RoomEntity> {
    private RECONNECTION_TIMEOUT_SEC = 60;

    load(events: DomainEvent[]):RoomEntity {
        return new RoomEntity(this.getRoomState(events));
    }

    getRoomState(events: DomainEvent[]): RoomState {
        return events.reduce(this.reducer.bind(this), new RoomState());
    }

    popClientConnection(state: RoomState, event: DomainEvent) {
        const clients = (state.clients || []);
        const index = clients.findIndex(c => c.clientID === event.payload.clientID);

        return [
            ...clients.slice(0, index),
            ...clients.slice(index + 1),
        ];
    }

    getClientsCount(clients: Client[], event: DomainEvent) {
        return clients.filter(c => c.clientID === event.payload.clientID).length;
    }

    reducer(state: RoomState, event: DomainEvent) {
        switch(event.type) {
            case RoomDomainEventTypes.ADD_CLIENT:
                return Object.assign(
                    {},
                    state,
                    { 
                        clients: [...(state.clients || []), event.payload],
                        clientsToDisconnect: (state.clientsToDisconnect || []).filter(c => c.clientID !== event.payload.clientID),
                        empty: false
                    }
                );
            case RoomDomainEventTypes.REMOVE_CLIENT:
                return Object.assign(
                    {},
                    state,
                    {
                        clients: this.popClientConnection(state, event),
                        clientsToDisconnect: (state.clientsToDisconnect || []).filter((c) => c.clientID !== event.payload.clientID).concat(
                            getNOW() - event.payload.ts > (this.RECONNECTION_TIMEOUT_SEC * 1000) && !this.getClientsCount(this.popClientConnection(state, event), event) ? 
                                event.payload 
                                : 
                                []
                        ),
                    }
                );
            case RoomDomainEventTypes.DISCONNECT_CLIENT:
                return Object.assign(
                    {},
                    state,
                    {
                        clientsToDisconnect: (state.clientsToDisconnect || []).filter(c => c.clientID !== event.payload.clientID),
                        empty: !state.clients.length
                    }
                );
            case RoomDomainEventTypes.KICK_CLIENT:
                return Object.assign(
                    {},
                    state,
                    {
                        clients: (state.clients || []).filter(c => c.clientID !== event.payload.clientID),
                        clientsToDisconnect: (state.clientsToDisconnect || []).concat(event.payload),
                    }
                );
            default:
                return state;
        }
    }
}