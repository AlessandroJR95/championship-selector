import { DomainEvent } from "src/modules/event/domain.event";
import { Question, QuizDomainEvents } from "src/features/quiz/domain/quiz.types";

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