export enum PermissionDomainEventTypes {
    ADD_USER_TOKEN = 'ADD_USER_TOKEN',
    ADD_OWNER_TOKEN = 'ADD_OWNER_TOKEN',
    REMOVE_TOKEN = 'REMOVE_TOKEN',
    REMOVE_ALL_TOKENS = 'REMOVE_ALL_TOKENS',
    ASSIGN_JUDGE = 'ASSIGN_JUDGE',
    ADD_INVITE_TOKEN = 'ADD_INVITE_TOKEN',
    USE_INVITE_TOKEN = 'USE_INVITE_TOKEN',
}

export class Permission {
    token: string;
    used: boolean;
}

export class PermissionState {
    userPermissions: Permission[];
    ownerPermissions: Permission[];
    judgeTokenLookup: Map<string, string>;

    constructor() {
        this.userPermissions = [];
        this.ownerPermissions = [];
        this.judgeTokenLookup = new Map();
    }
}