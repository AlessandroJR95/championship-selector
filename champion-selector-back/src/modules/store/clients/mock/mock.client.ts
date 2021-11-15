export class MockClient {
    private cache: Map<string, string>;

    constructor() {
        this.cache = new Map();   
    }

    append(key: string, data: string, cb: (err: Error) => void) {
        if (!this.cache.has(key)) this.cache.set(key, '');
        this.cache.set(key, this.cache.get(key).concat(data));
        cb(null);
    }

    del(key: string, cb: (err: Error) => void) {
        this.cache.delete(key);
        cb(null);
    }

    get(key: string, cb: (err: Error, data: any) => void) {
        cb(null, this.cache.get(key));
    }
}