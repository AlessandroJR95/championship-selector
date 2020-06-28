export class PermissionNotFound extends Error {
    constructor(message) {
        super(message || 'Permission not found');
        this.name = 'PermissionNotFound';
    }
}