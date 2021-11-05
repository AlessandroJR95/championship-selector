import { DomainEvent } from "../../modules/event/domain.event";
import { PermissionDomainEventTypes } from "./permission.types";

export class AddUserTokenEvent extends DomainEvent {
    constructor(token: string) {
        super(PermissionDomainEventTypes.ADD_USER_TOKEN, { token });
    }
}

export class AddOwnerTokenEvent extends DomainEvent {
    constructor(token: string) {
        super(PermissionDomainEventTypes.ADD_OWNER_TOKEN, { token });
    }
}

export class AddInviteTokenEvent extends DomainEvent {
    constructor(token: string) {
        super(PermissionDomainEventTypes.ADD_INVITE_TOKEN, { token, invite: true });
    }
}

export class UseInviteTokenEvent extends DomainEvent {
    constructor(token: string) {
        super(PermissionDomainEventTypes.USE_INVITE_TOKEN, { token });
    }
}

export class RemoveTokenEvent extends DomainEvent {
    constructor(token: string) {
        super(PermissionDomainEventTypes.REMOVE_TOKEN, { token });
    }
}

export class RemoveAllTokensEvent extends DomainEvent {
    constructor() {
        super(PermissionDomainEventTypes.REMOVE_ALL_TOKENS);
    }
}

export class AssignJudgeIDToTokenEvent extends DomainEvent {
    constructor(token: string, judgeID: string) {
        super(PermissionDomainEventTypes.ASSIGN_JUDGE, { token, judgeID });
    }
}