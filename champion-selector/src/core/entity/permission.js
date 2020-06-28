const OWNER = 'OWNER';
const USER = 'USER';

export class Permission {

    constructor(permissions) {
        this.types = permissions;
    }

    static createOwner() {
        return new Permission([OWNER, USER]);
    }

    static createUser() {
        return new Permission([USER]);
    }

    addOwnerPermission() {
        this.types.push(OWNER);
    }

    isOwnerPermission() {
        return this.types.some((t) => t === OWNER);
    }

    isUserPermission() {
        return this.types.some((t) => t === USER);
    }
}