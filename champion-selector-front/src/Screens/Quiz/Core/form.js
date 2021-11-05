import { Storage } from '../../../Core/storage';

class Form {
    constructor(storage) {
        this.storage = storage;
    }

    loadForm() {
        try {
            return JSON.parse(this.storage.get('form'));
        } catch (e) {
            return [];
        }
    }

    save(form) {
        this.storage.set('form', JSON.stringify(form));
    }

    clear() {
        this.storage.delete('form');
    }
}

export default new Form(new Storage());