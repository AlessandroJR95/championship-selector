import { BehaviorSubject, Subject, from } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';

export class RoomNotifier {
    private roomID: string;
    private subject: any;
    private DEFAULT_TIMEOUT = 30000;
    private ping: NodeJS.Timeout;
    private roomBus: RoomBus;
    private subscriptions: Map<string, any>;

    constructor(roomID: string, roomBus: RoomBus) {
        this.roomID = roomID;
        this.subject = new BehaviorSubject({});
        this.subscriptions = new Map();
        this.roomBus = roomBus;

        this.startPing();
    }

    stopPing() {
        clearInterval(this.ping);
    }

    startPing() {
        this.stopPing();
        this.ping = setInterval(() => {
            this.roomBus.ping(this.roomID);
        }, this.DEFAULT_TIMEOUT);
    }

    updateRoom() {
        this.subject.next();
    }

    clearSubscriptions() {
        [...this.subscriptions].forEach(([ key, sub ]) => {
            sub.subscription.unsubscribe();
        });
    }

    kick(clientID: string) {
        if (this.subscriptions.has(clientID)) {
            this.subscriptions.get(clientID).error(new Error('You got kicked'));
            this.roomBus.disconnect(this.roomID, clientID);
        }
    }

    subscribe(clientID: string, update: () => Promise<any>, next: (data: any) => void, error: (err: Error) => void, complete: () => void) {
        this.roomBus.connect(this.roomID, clientID);

        const subscription = this.subject.pipe(
            switchMap(() => from(update())),
        ).subscribe(next, error, complete);

        this.subscriptions.set(clientID, { subscription, error });

        return {
            disconnect: () => {
                subscription.unsubscribe();
                this.roomBus.disconnect(this.roomID, clientID);
            }
        }
    }
}

export class RoomBus {
    private queue: any;

    constructor() {
        this.queue = new Subject();
    }

    connect(roomID: string, clientID: string) {
        this.queue.next({ type: 'CONNECT', payload: { roomID, clientID }});
    }

    disconnect(roomID: string, clientID: string) {
        this.queue.next({ type: 'DISCONNECT', payload: { roomID, clientID }});
    }

    ping(roomID: string) {
        this.queue.next({ type: 'PING', payload: { roomID }});
    }

    onConnection() {
        return this.queue.pipe(
            filter(({ type }: any) => type === 'CONNECT'),
            map(({ payload }: any) => payload)
        );
    }

    onDisconnection() {
        return this.queue.pipe(
            filter(({ type }: any) => type === 'DISCONNECT'),
            map(({ payload }: any) => payload)
        );
    }

    onPing() {
        return this.queue.pipe(
            filter(({ type }: any) => type === 'PING'),
            map(({ payload }: any) => payload)
        );
    }
}

export class RoomCollection {
    private rooms: Map<string, RoomNotifier>;
    private roomBus: RoomBus;

    constructor() {
        this.rooms = new Map();
        this.roomBus = new RoomBus();
    }

    get(roomID: string) {
        if (!this.rooms.has(roomID)) {
            this.rooms.set(roomID, new RoomNotifier(roomID, this.roomBus));
        }

        return this.rooms.get(roomID);
    }

    delete(roomID: string) {
        if (this.rooms.has(roomID)) {
            this.rooms.get(roomID).stopPing();
            this.rooms.get(roomID).clearSubscriptions();
            this.rooms.delete(roomID);
        }
    }

    deleteAll() {
        [...this.rooms].forEach(([ roomID ]) => {
            this.delete(roomID);
        });
    }

    kick(roomID: string, clientID: string) {
        if (this.rooms.has(roomID)) {
            this.rooms.get(roomID).kick(clientID);
        }
    }

    getBus(): RoomBus {
        return this.roomBus;
    }
}