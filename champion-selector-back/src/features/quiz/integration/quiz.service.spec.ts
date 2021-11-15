import { ChampionshipService } from "src/core/championship/integration/championship.service";
import { ChampionshipRepository } from "src/core/championship/domain/championship.repository";
import { EventStoreFactory } from "src/modules/store/event.store.factory";
import { MockClientFactory } from "src/modules/store/clients/mock/mock.factory";
import { MockMessageFactory } from "src/modules/store/clients/mock/mock.factory";
import { EventStore } from "src/modules/store/event.store";
import { PermissionRepository } from "src/core/permission/domain/permission.repository";
import { MessageFactory } from "src/modules/message/message.factory";
import { MessageQueue } from "src/modules/message/message.queue";
import { EventBus } from "src/modules/event/event.bus";
import { CommandBus } from "src/modules/command/command.bus";
import { AddParticipantCommand, RemoveParticipantCommand, AddJudgeCommand, RemoveJudgeCommand, SetJudgeReadyCommand, StartChampionshipCommand, VoteInParticipantCommand, RestartChampionshipCommand, LikeParticipantCommand } from "src/core/championship/integration/championship.commands";
import { AddParticipantHandler, RemoveParticipantHandler, AddJudgeHandler, RemoveJudgeHandler, SetJudgeReadyHandler, StartChampionshipHandler, VoteInParticipantHandler, RestartChampionshipHandler, LikeParticipantHandler } from "../../../core/commands/championship/championship.handlers";
import { AggregateFactory } from "src/modules/aggregate/aggregate.factory";
import { ChampionshipAggregateFactory } from "src/core/championship/domain/championship.factory";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";
import { RoundGeneratorClassic } from "src/core/championship/domain/round.generator.classic";
import { RoundGeneratorChallenger } from "src/core/championship/domain/round.generator.challenger";
import { QuizRoundGenerator } from "src/features/quiz/domain/quiz.round.generator";
import { MultipleQuizCommand, ReadyQuizCommand } from "src/features/quiz/integration/quiz.commands";
import { MultipleQuizHandler, ReadyQuizHandler } from '../core/commands/quiz.handlers';
import { QuizChampionshipFactory } from "src/features/quiz/domain/quiz.factory";
import { QuizService } from "src/features/quiz/integration/quiz.service";
import { QuizRepository } from "src/features/quiz/domain/quiz.repository";

describe("ChampionshipService tests", () => {
    let championshipService: ChampionshipService;
    let quizService: QuizService;
    let championshipRepository: ChampionshipRepository;
    let quizRepository: QuizRepository;
    let permissionRepository: PermissionRepository;

    beforeEach(() => {
        const eventFactory = new EventStoreFactory(new MockClientFactory());
        const messageFactory = new MessageFactory(new MockMessageFactory());

        const eventStore = new EventStore(eventFactory);
        const messageQueue = new MessageQueue(messageFactory);

        const eventBus = new EventBus(messageQueue);
        const commandBus = new CommandBus(messageQueue, eventBus);
        const roundGenerator = new RoundGeneratorFactory(new RoundGeneratorClassic());
        roundGenerator.add('clg', new RoundGeneratorChallenger());
        roundGenerator.add('qzz', new QuizRoundGenerator());

        const aggregateFactory = new AggregateFactory(new ChampionshipAggregateFactory(roundGenerator));
        aggregateFactory.add('qzz', new QuizChampionshipFactory(roundGenerator));

        championshipRepository = new ChampionshipRepository(aggregateFactory, eventStore);
        permissionRepository = new PermissionRepository(eventStore);
        quizRepository = new QuizRepository(eventStore, roundGenerator);

        commandBus
            .addHandler(AddParticipantCommand, new AddParticipantHandler(championshipRepository))
            .addHandler(RemoveParticipantCommand, new RemoveParticipantHandler(championshipRepository))
            .addHandler(AddJudgeCommand, new AddJudgeHandler(championshipRepository, permissionRepository))
            .addHandler(RemoveJudgeCommand, new RemoveJudgeHandler(championshipRepository))
            .addHandler(SetJudgeReadyCommand, new SetJudgeReadyHandler(championshipRepository))
            .addHandler(StartChampionshipCommand, new StartChampionshipHandler(championshipRepository))
            .addHandler(VoteInParticipantCommand, new VoteInParticipantHandler(championshipRepository))
            .addHandler(RestartChampionshipCommand, new RestartChampionshipHandler(championshipRepository))
            .addHandler(LikeParticipantCommand, new LikeParticipantHandler(championshipRepository))
            .addRPCHandler(ReadyQuizCommand, new ReadyQuizHandler(championshipRepository, quizRepository))
            .addHandler(MultipleQuizCommand, new MultipleQuizHandler(championshipRepository, quizRepository));

        championshipService = new ChampionshipService(
            championshipRepository,
            permissionRepository,
            commandBus
        );

        quizService = new QuizService(
            commandBus,
            permissionRepository,
            quizRepository
        );
    });

    function getQuestion(desc: any) {
        return {
            text: desc,
            options: [
                { text: 'first_' + desc },
                { text: 'second_' + desc },
                { text: 'third_' + desc }
            ]
        };
    }

    it("should create championship", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz' });

        const championshipEntity = await championshipRepository.get(championship.championshipID);
        const permission = await permissionRepository.get(championship.championshipID);

        expect(championshipEntity.getState()).toEqual({
            generator: 'quizz',
            phase: 'PREPARATION',
            judges: [],
            participants: [],
            round: 0,
            rounds: [[]],
            votes: [[]],
            winners: [],
            score: null,
            likes: [],
            multiple: false,
            questions: undefined
        });

        expect(permission.hasOwnerPermission(championship.token)).toEqual(true);
    });

    it("should restart a quiz with mulitple option", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz', multiple: true });

        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' } });

        await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('1')], token: championship.token });
        await quizService.readyQuiz({ championshipID: championship.championshipID, token: user.token });

        let championshipEntity = await quizRepository.get(championship.championshipID);

        const questions = championshipEntity.getQuestions();

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${questions[0].questionID}_1`, token: user.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${questions[0].questionID}_2`, token: championship.token });

        await championshipService.restartChampionship({ championshipID: championship.championshipID, token: championship.token });

        championshipEntity = await quizRepository.get(championship.championshipID);

        expect(championshipEntity.getState().multiple).toEqual(true);
    });

    it("should add a question", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz' });
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });

        const questions = [{ text: 'ola?', options: [{ text: 'first' }, { text: 'second' }] }];

        await quizService.readyQuiz({ championshipID: championship.championshipID, questions, token: championship.token });

        let info = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: championship.token });

        expect(info.participants.length).toEqual(2);
    });

    it("should star championship with a question", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz' });
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('1'), getQuestion('2')], token: championship.token });

        let championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getCurrentRound().length).toEqual(3);
    });

    it("owner vote should decide match", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz' });
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' } });

        await quizService.readyQuiz({ championshipID: championship.championshipID, token: user.token });
        const { questions } = await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('1'), getQuestion('2')], token: championship.token });

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${questions[0].questionID}_1`, token: user.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${questions[0].questionID}_2`, token: championship.token });

        let championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getWinners()[0].participant.data.text).toEqual('third_1');
    });

    it("should NOT have multiple quiz", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz' });
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' } });

        await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('1'), getQuestion('2')], token: championship.token });

        try {
            await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('3'), getQuestion('4')], token: user.token });
        } catch (e) {
            expect(e.message).toEqual('This room cannot have multiple quiz');
        }
    });

    it("should have multiple quiz", async () => {
        const championship = await quizService.createQuiz({ type: 'qzz:qzz', multiple: true });
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' } });

        const championQuestion = await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('1'), getQuestion('2')], token: championship.token });

        const userQuestion = await quizService.readyQuiz({ championshipID: championship.championshipID, questions: [getQuestion('3'), getQuestion('4')], token: user.token });

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${championQuestion.questions[0].questionID}_1`, token: user.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${championQuestion.questions[0].questionID}_2`, token: championship.token });

        let championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getWinners()[0].participant.data.text).toEqual('third_1');

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${championQuestion.questions[1].questionID}_1`, token: user.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${championQuestion.questions[1].questionID}_2`, token: championship.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getWinners()[1].participant.data.text).toEqual('third_2');

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${userQuestion.questions[0].questionID}_1`, token: user.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${userQuestion.questions[0].questionID}_2`, token: championship.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getWinners()[2].participant.data.text).toEqual('second_3');

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${userQuestion.questions[1].questionID}_0`, token: user.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: `${userQuestion.questions[1].questionID}_2`, token: championship.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getWinners()[3].participant.data.text).toEqual('first_4');
    });

});