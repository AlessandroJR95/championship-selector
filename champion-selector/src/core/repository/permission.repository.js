import { Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { generateIDForMap } from '../utils/hash';
import { PermissionNotFound } from '../exceptions/PermissionNotFound';
import { Permission } from '../entity/permission'

export class PermissionRepository {
    constructor() {
        this.permissions = new Map();
        this.queue = new Subject();
    }

    onLostOwnership() {
        return this.queue.pipe(
            filter((action) => action.type === 'LOST_OWNERSHIP'),
            map((action) => action.payload)
        )
    }

    dispatch(action) {
        this.queue.next(action);
    }

    getPermission({ championshipID, token }) {
        if (this.permissions.has(championshipID) && this.permissions.get(championshipID).has(token)) {
            return this.permissions.get(championshipID).get(token);
        }

        throw new PermissionNotFound();
    }

    createOwnerToken({ championshipID }) {
        const token = generateIDForMap(this.permissions);
        
        if (this.permissions.has(championshipID)) {
            throw new Error('Championship already has an owner');
        } else {
            this.permissions.set(championshipID, new Map().set(token, Permission.createOwner()));
        }

        return { token };
    }

    createUserToken({ championshipID }) {
        const token = generateIDForMap(this.permissions);

        if (!this.permissions.has(championshipID)) {
            throw new Error('Championship dosent exists');
        } else {
            this.permissions.get(championshipID).set(token, Permission.createUser());
        }

        return { token };
    }

    changeOwnership({ championshipID }) {
        let newOwner  = null;

        if (this.permissions.has(championshipID) && !this.hasOwnership({ championshipID })) {
            for (let [token, permission] of this.permissions.get(championshipID)) {
                newOwner = token;
                permission.addOwnerPermission();
                break;
            }
        }

        return {
            token: newOwner
        }
    }

    hasOwnership({ championshipID }) {
        if (this.permissions.has(championshipID)) {
            return [...this.permissions.get(championshipID).values()].some((permission) => permission.isOwnerPermission());
        }

        return false;
    }

    hasOwnerPermission({ championshipID, token }) {
        try {
            return this.getPermission({ championshipID, token }).isOwnerPermission();
        } catch (e) {
            if (e instanceof PermissionNotFound) {
                return false;
            }

            throw e;
        }
    }

    hasUserPermission({ championshipID, token }) {
        try {
            return this.getPermission({ championshipID, token }).isUserPermission();
        } catch (e) {
            if (e instanceof PermissionNotFound) {
                return false;
            }

            throw e;
        }
    }

    removeToken({ championshipID, token }) {
        if (this.permissions.has(championshipID) && this.permissions.get(championshipID).has(token)) {
            const permission = this.permissions.get(championshipID);
            const wasOwner = permission.get(token).isOwnerPermission();
            
            permission.delete(token);

            if (wasOwner) {
                this.dispatch({ type: 'LOST_OWNERSHIP', payload: { championshipID }});
            }
        }
    }

    remove({ championshipID }) {
        this.permissions.delete(championshipID);
    }
}