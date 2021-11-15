import axios from "axios";
import { Winner } from "src/core/championship/domain/championship.entity.winner";

export class MovieData {
    getFromGenre(winner: Winner) {
        return axios.get(`http://movie:9090/byGenre/${winner.participant.participantID}`).then(({ data }: any) => {
            return Promise.resolve(data.results.map((item: any, index: number) => ({ participantID: index, data: Object.assign({ text: item.title }, item) })));
        });
    }
}