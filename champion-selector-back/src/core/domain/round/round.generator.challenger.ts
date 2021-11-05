import { IRoundGenerator, ChampionshipState, Participant, Round } from "../championship/championship.types";
import { ChampionshipEntity } from "../championship/championship.entity";

export class RoundGeneratorChallenger implements IRoundGenerator<ChampionshipState> {
    private options: Map<any, any>;

    constructor() {
        this.options = new Map();
    }

    create() {
        return new RoundGeneratorChallenger();
    }

    getRoundWinner(state: ChampionshipState) {
        return ChampionshipEntity.getRoundWinner(state);
    }

    getType() {
        return 'clg';
    }

    getOptions() {
        return [...this.options];
    }

    generateInitialRounds(state: ChampionshipState): Round<Participant>[] {
        const rounds = ChampionshipEntity.generateRounds(state);
        const initialScore = new Map(state.score);
        this.options = new Map();

        rounds.forEach((round: Round<Participant>) => {
            round[0] && this.options.set(round[0].participantID, 0);
            round[1] && this.options.set(round[1].participantID, 0);
        });

        initialScore.forEach((score, participantID) => {
            this.options.set(participantID, score);
        });

        const stackOpts = [...this.options].sort((a, b) => a[1] > b[1] ? -1 : 1);

        const firstP = stackOpts.pop();
        const secondP = stackOpts.pop();
        this.options = new Map(stackOpts);

        return firstP && secondP ? [
            [
                ChampionshipEntity.findParticipant(state, firstP[0]),
                ChampionshipEntity.findParticipant(state, secondP[0])
            ]
        ] : state.rounds;
    }

    generateRound(state: ChampionshipState): Round<Participant>[] {
        const winner = ChampionshipEntity.getRoundWinner(state);
        const currentScore = new Map(state.score);
        this.options.set(winner.participant.participantID, currentScore.get(winner.participant.participantID));
        const filtered = [...this.options].sort((a, b) => a[1] > b[1] ? -1 : 1);
        const firstP = filtered.pop();
        const secondP = filtered.pop();
        this.options = new Map(filtered);

        return firstP && secondP ? state.rounds.concat([
            [
                ChampionshipEntity.findParticipant(state, firstP[0]),
                ChampionshipEntity.findParticipant(state, secondP[0])
            ]
        ]) : state.rounds;
    }

    isFinalRound(state: ChampionshipState): Boolean {
        return this.options.size === 0;
    }
}