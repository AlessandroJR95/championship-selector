import { IAggregate } from "../../modules/interfaces";
import { PermissionEntity } from "./permission.entity";
import { DomainEvent } from "../../modules/event/domain.event";
import { PermissionState, PermissionDomainEventTypes } from "./permission.types";

export class PermissionAggregate implements IAggregate<PermissionEntity> {
    load(events: DomainEvent[]) {
        return new PermissionEntity(this.getPermissionState(events));
    }

    getPermissionState(events: DomainEvent[]) {
        return events.reduce(this.reducer.bind(this), new PermissionState());
    }

    reducer(currentState: PermissionState, event: DomainEvent) {
        let state = this.eventReducer(currentState, event);
        state.ownerPermissions = PermissionEntity.changeOwnership(state);
        return state;
    }

    eventReducer(state: PermissionState, event: DomainEvent) {
        switch(event.type) {
            case PermissionDomainEventTypes.ADD_USER_TOKEN:
                return Object.assign({}, state, { userPermissions: [...(state.userPermissions || []), event.payload] });
            case PermissionDomainEventTypes.ADD_INVITE_TOKEN:
                return Object.assign({}, state, { userPermissions: [...(state.userPermissions || []), event.payload] });
            case PermissionDomainEventTypes.USE_INVITE_TOKEN:
                return Object.assign({}, state, {
                    userPermissions: [
                        ...(state.userPermissions || []).filter((p) => p.token !== event.payload.token),
                        Object.assign({}, state.userPermissions.find((p) => p.token === event.payload.token), { used: true })
                    ]
                });
            case PermissionDomainEventTypes.ADD_OWNER_TOKEN:
                return Object.assign({}, state, {
                    ownerPermissions: [...(state.ownerPermissions || []), event.payload],
                    userPermissions: [...(state.userPermissions || []), event.payload],
                });
            case PermissionDomainEventTypes.REMOVE_ALL_TOKENS:
                return Object.assign({}, state, { userPermissions: [], ownerPermissions: [], judgeTokenLookup: new Map() });
            case PermissionDomainEventTypes.REMOVE_TOKEN:
                return Object.assign({}, state, {
                    userPermissions: (state.userPermissions || []).filter((a) => a.token !== event.payload.token),
                    ownerPermissions: (state.ownerPermissions || []).filter((a) => a.token !== event.payload.token),
                    judgeTokenLookup: new Map([...state.judgeTokenLookup].filter((tuple) => tuple[0] !== event.payload.token))
                });
            case PermissionDomainEventTypes.ASSIGN_JUDGE:
                return Object.assign({}, state, {
                    judgeTokenLookup: new Map([...state.judgeTokenLookup]).set(event.payload.token, event.payload.judgeID)
                });
            default:
                return state;
        }
    }
}