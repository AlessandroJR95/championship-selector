import { IEventSourcedRepository } from "src/modules/interfaces";
import { PermissionEntity } from "src/core/permission/domain/permission.entity";
import { EventStore } from "src/modules/store/event.store";
import { PermissionAggregate } from "src/core/permission/domain/permission.aggregate";
import { DomainEvent } from "src/modules/event/domain.event";
import { AddInviteTokenEvent, AddOwnerTokenEvent, AddUserTokenEvent, AssignJudgeIDToTokenEvent, RemoveTokenEvent, UseInviteTokenEvent } from "src/core/permission/domain/permission.domain.events";

export class PermissionRepository implements IEventSourcedRepository<PermissionEntity> {
    private eventStore: EventStore;
    
    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
    }

    getKEY(identifier: string): string {
        return `permission/${identifier}`;
    }

    createOwnerToken(entityID: string, token: string): Promise<any> {
        return this.save(entityID, new AddOwnerTokenEvent(token));
    }
    
    createUserToken(entityID: string, token: string): Promise<any> {
        return this.save(entityID, new AddUserTokenEvent(token));
    }

    createInviteToken(entityID: string, token: string) {
        return this.save(entityID, new AddInviteTokenEvent(token));
    }

    useInviteToken(entityID: string, token: string) {
        return this.save(entityID, new UseInviteTokenEvent(token));
    }

    assignJudgeToAToken(entityID: string, judgeID: string, token: string) {
        return this.save(entityID, new AssignJudgeIDToTokenEvent(token, judgeID));
    }

    removeToken(entityID: string, token: string) {
        return this.save(entityID, new RemoveTokenEvent(token));
    }

    delete(entityID: string) {
        this.eventStore.delete(this.getKEY(entityID));
    }
    
    save(entityID: string, event: DomainEvent) {
        return this.eventStore.pushTo(this.getKEY(entityID), event);
    }

    get(entityID: string): Promise<PermissionEntity> {
        return this.eventStore.getEvents(this.getKEY(entityID))
            .then((events) => Promise.resolve(new PermissionAggregate().load(events)));
    }
}