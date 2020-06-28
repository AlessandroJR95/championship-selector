import { BehaviorSubject } from "rxjs";

export class Room {
    constructor(roomID, queue) {
        this.roomID = roomID;
        this.subject = new BehaviorSubject();
        this.queue = queue;
        this.clients = new Map();
        this.timers = new Map();
        this.DEFAULT_TIMEOUT = 30000;
        this.UNITIALIZED_ROOM_TIMEOUT = 60000;
        this.ping = null;
        this.killed = false;

        this.startPing();
        this.startReconectionTimer({ clientID: roomID, type: 'EMPTY_ROOM', timeout: this.UNITIALIZED_ROOM_TIMEOUT });
    }

    kill() {
        this.killed = true;
        this.killTimers();
        this.removeClients();
        this.stopPing();
    }

    startPing() {
        this.ping = setInterval(() => {
            this.subject.next(this.subject.value);
        }, this.DEFAULT_TIMEOUT);
    }

    killTimers() {
        for (let clientID of this.timers.keys()) {
            this.clearReconectionTimer({ clientID });
        }
    }

    removeClients() {
        for (let clientID of this.clients.keys()) {
            this.removeClient({ clientID });
        }
    }

    stopPing() {
        clearInterval(this.ping);
    }

    addClient({ clientID, subscription, observable }) {
        this.clients.set(clientID, { subscription, observable });
        this.clearReconectionTimer({ clientID: this.roomID });
    }

    removeClient({ clientID }) {
        if (this.clients.has(clientID)) {
            this.clients.get(clientID).subscription.unsubscribe();
            this.clients.delete(clientID);
        }

        if (!this.clients.size) {
            this.startReconectionTimer({ clientID: this.roomID, type: 'EMPTY_ROOM' });
        }
    }

    hasClient({ clientID }) {
        return this.clients.has(clientID);
    }

    startReconectionTimer({ clientID, type, timeout }) {
        this.clearReconectionTimer({ clientID });

        this.timers.set(
            clientID,
            setTimeout(() => {
                this.queue.next({ type, payload: { clientID, roomID: this.roomID }})
            }, timeout || this.DEFAULT_TIMEOUT)
        )
    }

    clearReconectionTimer({ clientID }) {
        clearTimeout(this.timers.get(clientID));
        this.timers.delete(clientID);
    }

    subscribe(clientID, { next, error, complete }) {
        this.addClient({ 
            clientID,
            subscription: this.subject.asObservable().subscribe(next, error, complete),
            observable: { next, error, complete }
        });

        this.clearReconectionTimer({ clientID });

        return {
            disconnect: () => {
                if (!this.killed) {
                    this.removeClient({ clientID });
                    this.startReconectionTimer({ clientID, type: 'DISCONECTED' });
                }
            }
        }
    }

    notify({ clientID, type, data }) {
        if (this.clients.has(clientID)) {
            this.clients.get(clientID).observable[type](data);
        }
    }

    notifyError({ clientID, data }) {
        this.notify({clientID, data, type: 'error'});
    }

    send(data) {
        this.subject.next(data);
    }
}