import { IRoundGenerator, Round, Participant, ChampionshipState } from "../../../../core/domain/championship/championship.types";
import { ChampionshipEntity } from "../../../../core/domain/championship/championship.entity";
import { Winner } from "../../../../core/domain/championship/championship.entity.winner";
import { QuizChampionshipState } from "./quiz.types";

export class QuizRoundGenerator implements IRoundGenerator<QuizChampionshipState> {
    create() {
        return new QuizRoundGenerator();
    }

    getType() {
        return 'quizz';
    }

    getOptions(): any[][] {
        return [[]];
    }

    getRoundWinner(state: QuizChampionshipState): Winner {
        const winnerVote = state.votes[state.round].find((vote) => vote.judge.judgeID === state.questions[state.round].judgeID);

        return new Winner(state.rounds[state.round].find((item) => item.participantID === winnerVote.participant.participantID));
    }

    generateInitialRounds(state: QuizChampionshipState): Round<Participant>[] {
        const questions = state.questions;
        let rounds = [] as Round<Participant>[];

        for (let question of questions) {
            rounds.push(state.participants.filter((p) => p.data.questionID === question.questionID));
        }

        return rounds;
    }

    generateRound(state: ChampionshipState): Round<Participant>[] {
        return state.rounds;
    }

    isFinalRound(state: ChampionshipState): Boolean {
        return state.rounds.length === state.round + 1;
    }
}