import { ICommandHandler } from "src/modules/interfaces";
import { Command } from "src/modules/command/command";
import { EventBus } from "src/modules/event/event.bus";
import { ChampionshipUpdated } from "src/core/championship/integration/championship.events";
import { ChampionshipRepository } from "src/core/championship/domain/championship.repository";
import { QuizRepository } from "src/features/quiz/domain/quiz.repository";
import { QuizEntity } from "src/features/quiz/domain/quiz.entity";
import { Participant } from "src/core/championship/domain/championship.types";
import { Question } from "src/features/quiz/domain/quiz.types";

export class ReadyQuizHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;
    private quizRepository: QuizRepository;

    constructor(
        championshipRepository: ChampionshipRepository,
        quizRepository: QuizRepository,
    ) {
        this.championshipRepository = championshipRepository;
        this.quizRepository = quizRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        return this.quizRepository.setQuestions(command.entityID, command.payload.questions)
            .then(() => Promise.all(
                command.payload.questions
                    .map((question: Question) => Promise.all(
                        QuizEntity.getQuestionParticipants(question)
                            .map((participant: any, index: any) => this.championshipRepository.addParticipant(
                                command.entityID, 
                                new Participant(`${participant.questionID}_${index}`, null, participant)
                            ))
                    ))
            ))
            .then(() => this.championshipRepository.setJudgeReady(command.entityID, command.payload.judgeID))
            .then(() => this.quizRepository.get(command.entityID))
            .then((quiz) => {
                if (quiz.hasAllJudgesReady()) {
                    return this.championshipRepository.startChampionship(command.entityID);
                }

                return Promise.resolve();
            })
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}

export class MultipleQuizHandler implements ICommandHandler {
    private championshipRepository: ChampionshipRepository;
    private quizRepository: QuizRepository;

    constructor(
        championshipRepository: ChampionshipRepository,
        quizRepository: QuizRepository,
    ) {
        this.championshipRepository = championshipRepository;
        this.quizRepository = quizRepository;
    }

    handle(command: Command, eventBus: EventBus) {
        return this.quizRepository.setMultipleQuiz(command.entityID, command.payload)
            .then(() => {
                eventBus.dispatch(new ChampionshipUpdated(command.entityID, command.entityID));
            });
    }
}