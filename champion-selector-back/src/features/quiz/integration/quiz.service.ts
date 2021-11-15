import { PermissionRepository } from "src/core/permission/domain/permission.repository";
import { CommandBus } from "src/modules/command/command.bus";
import { MultipleQuizCommand, ReadyQuizCommand } from "src/features/quiz/integration/quiz.commands";
import { generateID } from "src/modules/utils/hash";
import { Question } from "src/features/quiz/domain/quiz.types";
import { QuizRepository } from "src/features/quiz/domain/quiz.repository";

export class QuizService {
    private permissionRepository: PermissionRepository;
    private quizRepository: QuizRepository;
    private commandBus: CommandBus;

    constructor(
        commandBus: CommandBus,
        permissionRepository: PermissionRepository,
        quizRepository: QuizRepository
    ) {
        this.permissionRepository = permissionRepository;
        this.quizRepository = quizRepository;
        this.commandBus = commandBus;
    }

    async readyQuiz({ championshipID, questions, token }: any) {
        const [ quiz, permission ] = await Promise.all([
            this.quizRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        const judgeID = permission.getJudgeID(token);

        if (!quiz.canHaveMultipleQuiz() && !permission.hasOwnerPermission(token) && questions) {
            throw new Error('This room cannot have multiple quiz');
        }

        const createdQuestions = (questions || []).map((question: any) => new Question(generateID(), judgeID, question));

        await this.commandBus.dispatchRPC(new ReadyQuizCommand(championshipID, judgeID, createdQuestions));

        return {
            championshipID,
            questions: createdQuestions
        };
    }

    async createQuiz({ type, multiple }: any) {
        const championshipID = `${generateID({ short: true })}${type ? ':' + type : '::clg'}`;
        const token = generateID();

        await this.permissionRepository.createOwnerToken(championshipID, token);

        await this.commandBus.dispatch(new MultipleQuizCommand(championshipID, Boolean(multiple)));

        return {
            championshipID,
            token
        };
    }
}