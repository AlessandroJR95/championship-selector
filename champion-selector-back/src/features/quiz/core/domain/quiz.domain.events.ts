import { DomainEvent } from "../../../../core/modules/event/domain.event";
import { Question, QuizDomainEvents } from "./quiz.types";

export class SetQuestions extends DomainEvent {
    constructor(questions: Question[]) {
        super(QuizDomainEvents.SET_QUESTIONS, questions);
    }
}

export class SetMultipleQuiz extends DomainEvent {
    constructor(canHaveMultipleQuiz: boolean) {
        super(QuizDomainEvents.SET_MULTIPLE_QUIZ, canHaveMultipleQuiz);
    }
}