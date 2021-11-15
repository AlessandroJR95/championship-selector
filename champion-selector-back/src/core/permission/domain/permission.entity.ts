import { PermissionState, Permission } from "src/core/permission/domain/permission.types";

export class PermissionEntity {
    private state: PermissionState;

    constructor(state: PermissionState) {
        this.state = state;
    }
    
    static changeOwnership(state: PermissionState): Permission[] {
        if (!state.ownerPermissions.length && state.userPermissions.length) {
            return state.ownerPermissions.concat(state.userPermissions[0]);
        }

        return state.ownerPermissions;
    }

    hasOwnerPermission(token: string): boolean {
        return this.state.ownerPermissions.some((t) => t.token === token);
    }

    hasUserPermission(token: string): boolean {
        return this.state.userPermissions.some((t) => t.token === token);
    }

    hasValidInvite(token: string): boolean {
        const found = this.state.userPermissions.find((t) => t.token === token);

        if (found) {
            return !found.used;
        }

        return false;
    }

    hasPermission(token: string): boolean {
        return this.state.userPermissions.concat(this.state.ownerPermissions).some((t) => t.token === token);
    }

    hasOwnership(): boolean {
        return Boolean(this.state.ownerPermissions.length);
    }

    getOwnerToken(): string {
        return (this.state.ownerPermissions[0] || {}).token;
    }

    getJudgeToken(judgeID: string): string {
        try {
            return [...this.state.judgeTokenLookup].find((tuple) => tuple[1] === judgeID)[0];
        } catch (e) {
            return null;
        }
    }

    getJudgeID(token: string): string {
        return this.state.judgeTokenLookup.get(token) || null;
    }
}