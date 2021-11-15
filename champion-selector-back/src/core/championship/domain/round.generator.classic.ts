import { IRoundGenerator, Round, Participant, ChampionshipState } from "src/core/championship/domain/championship.types";
import { ChampionshipEntity } from "src/core/championship/domain/championship.entity";

export class RoundGeneratorClassic implements IRoundGenerator<ChampionshipState> {
    create() {
        return new RoundGeneratorClassic();
    }

    getType() {
        return 'classic';
    }

    getOptions(): any[][] {
        return [[]];
    }

    getRoundWinner(state: ChampionshipState) {
        return ChampionshipEntity.getRoundWinner(state);
    }

    generateInitialRounds(state: ChampionshipState): Round<Participant>[] {
        return ChampionshipEntity.generateRounds(state);
    }

    generateRound(state: ChampionshipState): Round<Participant>[] {
        const rounds = state.rounds;
        const winner = ChampionshipEntity.getRoundWinner(state);
        const lastRound = rounds[rounds.length - 1];
        const newRoundState = !lastRound || lastRound.length > 1 ? rounds.concat([[winner.participant]]) : [
            ...rounds.slice(0, -1),
            [lastRound[0], winner.participant]
        ];

        return newRoundState;
    }

    isFinalRound(state: ChampionshipState): Boolean {
        return state.rounds.length === state.round + 1;
    }
}