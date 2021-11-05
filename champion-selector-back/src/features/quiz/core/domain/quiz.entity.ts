import { mulberry32, xmur3 } from '../../../../core/modules/utils/hash';
import { ChampionshipEntity } from "../../../../core/domain/championship/championship.entity";
import { Question, QuizChampionshipState } from "./quiz.types";

export class QuizEntity extends ChampionshipEntity {
    protected state: QuizChampionshipState;

    constructor(state: QuizChampionshipState) {
        super(state);
    }

    static getQuestionParticipants(question: Question) {
        return question.data.options.map((item: any) => ({ text: item.text, questionID: question.questionID }));
    }

    static alternateQuestions(state: QuizChampionshipState, questions: Question[]) {
        let list = [] as Question[];
        const actual = state.questions || [];
        const question = questions.slice(0);

        for (let index = 0; index < Math.max(actual.length, question.length); index++) {
            let temp = [];

            if (actual[index]) {
                temp.push(actual[index]);
            }

            if (question[index]) {
                temp.push(question[index]);
            }

            list = list.concat(temp);
        }
        
        return list;
    }

    getState() {
        return {
            phase: this.state.phase,
            judges: this.state.judges,
            participants: this.state.participants,
            round: this.state.round,
            rounds: this.state.rounds,
            votes: this.state.votes,
            winners: this.state.winners,
            generator: this.state.generator,
            score: this.state.score,
            likes: this.state.likes,
            questions: this.state.questions,
            multiple: this.state.multiple
        };
    }

    hasAllJudgesReady(): boolean {
        const actualJudges = this.getJudges(); 
        const judgesReady = actualJudges.filter((judge) => Boolean(judge.ready));
        return actualJudges.length === judgesReady.length; 
    }

    canHaveMultipleQuiz() {
        return this.state.multiple;
    }

    getQuestions(): Question[] {
        return this.state.questions;
    }

}