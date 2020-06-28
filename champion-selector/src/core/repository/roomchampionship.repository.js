export class RoomChampionshipRepository {
    constructor() {
        this.roomChampionship = new Map();
    }

    assignChampionshipToRoom({ roomID, championshipID }) {
        this.roomChampionship.set(roomID, championshipID);
    }

    getChampionshipID({ roomID }) {
        return {
            championshipID: this.roomChampionship.get(roomID)
        };
    }
    
    hasChampionship({ roomID }) {
        return this.roomChampionship.has(roomID);
    }

    remove({ roomID }) {
        this.roomChampionship.delete(roomID);
    }

}