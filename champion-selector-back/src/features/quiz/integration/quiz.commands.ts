import { Command } from "src/modules/command/command";
import { QuizCommands, Question } from "src/features/quiz/domain/quiz.types";

export class ReadyQuizCommand extends Command {
    constructor(entityID: any, judgeID: string, questions: Question[]) {
        super(entityID, QuizCommands.READY_QUIZ, { judgeID, questions });
    }
}

export class MultipleQuizCommand extends Command {
    constructor(entityID: any, canHaveMultipleQuestions: boolean) {
        super(entityID, QuizCommands.MULTIPLE_QUIZ, canHaveMultipleQuestions);
    }
}