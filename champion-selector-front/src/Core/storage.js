export class Storage {
    set(key, data) {
        localStorage.setItem(key, data);
    }

    get(key) {
        return localStorage.getItem(key);
    }

    delete(key) {
        return localStorage.removeItem(key);
    }
}