class Notification {
    constructor() {
        this.listeners = [];
    }

    subscribe(next) {
        this.listeners.push(next);

        return () => {
            this.listeners = this.listeners.filter((cb) => cb !== next);
        }
    }

    notify(type, message) {
        this.listeners.forEach((listener) => {
            listener({ type, message });
        });
    }

    error(message) {
        this.notify('error', message);
    }

    success(message) {
        this.notify('success', message);
    }
}

export default new Notification();