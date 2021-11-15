import { ChampionshipState } from "src/core/championship/domain/championship.types";

export class QuizChampionshipState extends ChampionshipState {
    questions: Question[];
    multiple: boolean;
    questionWinners: any[];
}

export enum QuizCommands {
    READY_QUIZ = 'READY_QUIZ',
    MULTIPLE_QUIZ = 'MULTIPLE_QUIZ'
}

export enum QuizDomainEvents {
    SET_QUESTIONS = 'SET_QUESTIONS',
    SET_MULTIPLE_QUIZ = 'SET_MULTIPLE_QUIZ'
}

export class Question {
    judgeID: string;
    questionID: string;
    data: any;

    constructor(questionID: string, judgeID: string, data: any) {
        this.judgeID = judgeID;
        this.questionID = questionID;
        this.data = data;
    }
}