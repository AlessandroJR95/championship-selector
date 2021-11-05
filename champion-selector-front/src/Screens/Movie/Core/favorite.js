import { Storage } from '../../../Core/storage';

class Favorite {
    constructor(storage) {
        this.storage = storage;
    }

    getAll() {
        try {
            return JSON.parse(this.storage.get('favorites'));
        } catch (e) {
            return [];
        }
    }

    get(lookupObj) {
        try {
            const key = Object.keys(lookupObj)[0];
            const value = lookupObj[key];
        
            return JSON.parse(this.storage.get('favorites')).find((item) => item[key] === value);
        } catch (e) {
            return null;
        }
    }

    set(data) {
        this.storage.set('favorites', JSON.stringify(data));
    }

    add(participant, callback) {
        const added = [participant].concat(this.getAll() || []);
        this.set(added);
        callback(added);
    }

    remove(participantID, callback) {
        const filtered = this.getAll().filter((fav) => fav.participantID !== participantID);
        this.set(filtered);
        callback(filtered);
    }
}

export default new Favorite(new Storage());