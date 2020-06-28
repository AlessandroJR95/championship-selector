import { Room } from '../entity/room';
import { generateIDForMap } from '../utils/hash';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class RoomRepository {
    constructor() {
        this.rooms = new Map();
        this.queue = new Subject();
    }

    onDisconnection() {
        return this.queue.pipe(
            filter((action) => action.type === 'DISCONECTED'),
            map((action) => action.payload)
        );
    }

    onRoomEmpty() {
        return this.queue.pipe(
            filter((action) => action.type === 'EMPTY_ROOM'),
            map((action) => action.payload)
        );
    }

    createRoom() {
        const roomID = generateIDForMap(this.rooms);
        this.rooms.set(roomID, new Room(roomID, this.queue));
        return { roomID };
    }

    getRoom({ roomID }) {
        if (!this.rooms.has(roomID)) {
            throw new Error('Could not get room');
        }

        return this.rooms.get(roomID);
    }

    hasConnectedClient({ roomID, clientID }) {
        return this.getRoom({ roomID }).hasClient({ clientID });
    }

    notifyError({ roomID, clientID, data }) {
        return this.getRoom({ roomID }).notifyError({ clientID, data });
    }

    subscribeToRoom({ roomID, clientID, observable, prepare }) {
        prepare && prepare();
        return this.getRoom({ roomID }).subscribe(clientID, observable);
    }

    sendToRoom({ roomID, data }) {
        this.getRoom({ roomID }).send(data);
    }

    remove({ roomID }) {
        this.getRoom({ roomID }).kill();
        this.rooms.delete(roomID);
    }
}