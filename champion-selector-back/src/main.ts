import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import RedisStore from 'connect-redis';
import { MessageFactory } from "./core/modules/message/message.factory";
import { AmqpFactory } from "./core/modules/message/clients/amqp/amqp.factory";
import { MessageQueue } from "./core/modules/message/message.queue";
import { EventStoreFactory } from "./core/modules/store/event.store.factory";
import { RedisClientFactory } from "./core/modules/store/clients/redis/redis.factory";
import { EventStore } from "./core/modules/store/event.store";
import { CommandBus } from "./core/modules/command/command.bus";
import { EventBus } from "./core/modules/event/event.bus";
import { RoomService } from "./services/room/room.service";
import { RoomRepository } from "./core/domain/room/room.repository";
import { RoomCollection } from "./services/room/room.collection";
import { ChampionshipRepository } from "./core/domain/championship/championship.repository";
import { AddParticipantCommand, RemoveParticipantCommand, AddJudgeCommand, RemoveJudgeCommand, SetJudgeReadyCommand, StartChampionshipCommand, VoteInParticipantCommand, RestartChampionshipCommand, ValidateChampionshipCommand, LikeParticipantCommand } from "./core/commands/championship/championship.commands";
import { AddParticipantHandler, RemoveParticipantHandler, AddJudgeHandler, RemoveJudgeHandler, SetJudgeReadyHandler, StartChampionshipHandler, VoteInParticipantHandler, RestartChampionshipHandler, ValidateChampionshipHandler, LikeParticipantHandler } from "./core/commands/championship/championship.handlers";
import { ChampionshipUpdated } from "./core/events/championship/championship.events";
import { ChampioshipUpdatedHandler } from "./core/events/championship/championship.handlers";
import { PermissionRepository } from "./core/domain/permission/permission.repository";
import { ChampionshipService } from "./services/championship/championship.service";
import { ApiController } from "./controllers/api.controller";
import { RoomKickEventHandler } from './core/events/room/room.handlers';
import { RoomClientKickEvent } from './core/events/room/room.events';
import { KickClientCommand } from './core/commands/room/room.commands';
import { KickClientCommandHandler } from './core/commands/room/room.handlers';
import { MovieController } from './features/movie/controllers/movie.controller';
import { MovieService } from './features/movie/services/movie.service';
import { GenerateMovieParticipants } from './features/movie/core/commands/movie.commands';
import { GenerateMovieParticipantsHandler } from './features/movie/core/commands/movie.handlers';
import { MovieRepository } from './features/movie/core/domain/movie.repository';
import { AggregateFactory } from './core/modules/aggregate/aggregate.factory';
import { ChampionshipAggregateFactory } from './core/factories/championship.factory';
import { MovieChampionshipFactory } from './features/movie/core/factory/movie.factory';
import { MovieData } from './features/movie/core/domain/movie.data';
import { RoundGeneratorFactory } from './core/factories/round.generator.factory';
import { RoundGeneratorClassic } from './core/domain/round/round.generator.classic';
import { RoundGeneratorChallenger } from './core/domain/round/round.generator.challenger';
import { QuizChampionshipFactory } from './features/quiz/core/factory/quiz.factory';
import { QuizRoundGenerator } from './features/quiz/core/domain/quiz.round.generator';
import { QuizService } from './features/quiz/services/quiz.service';
import { QuizRepository } from './features/quiz/core/domain/quiz.repository';
import { QuizController } from './features/quiz/controllers/quiz.controller';
import { MultipleQuizCommand, ReadyQuizCommand } from './features/quiz/core/commands/quiz.commands';
import { MultipleQuizHandler, ReadyQuizHandler } from './features/quiz/core/commands/quiz.handlers';
import { ChampionshipEntity } from './core/domain/championship/championship.entity';

const RedisSession = RedisStore(session);

process.on('uncaughtException', err => {
    fs.appendFile(path.join(process.env.LOG_PATH, 'error.log'), `${err.message}\n${err.stack}`, (err) => {
        if (err) console.error(err); 
        console.log('Log created');
    });
});

const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch((err) => {
            next(err);
        });
};

function bootstrap(app: any) {
    const messageFactory = new MessageFactory(new AmqpFactory());
    const redisFactory = new RedisClientFactory();
    const eventStoreFactory = new EventStoreFactory(redisFactory);
    const redisClient = redisFactory.create().getClient();

    const roundGenerator = new RoundGeneratorFactory(new RoundGeneratorClassic());
    const aggregateFactory = new AggregateFactory(new ChampionshipAggregateFactory(roundGenerator));

    roundGenerator.add('clg', new RoundGeneratorChallenger());
    roundGenerator.add('qzz', new QuizRoundGenerator());
    aggregateFactory.add('movie', new MovieChampionshipFactory(roundGenerator));
    aggregateFactory.add('qzz', new QuizChampionshipFactory(roundGenerator));

    const messageQueue = new MessageQueue(messageFactory);
    const eventStore = new EventStore(eventStoreFactory);
    const eventBus = new EventBus(messageQueue);
    const commandBus = new CommandBus(messageQueue, eventBus);

    const roomRepository = new RoomRepository(eventStore);
    const roomCollection = new RoomCollection();

    const championshipRepository = new ChampionshipRepository(aggregateFactory, eventStore);
    const permissionRepository = new PermissionRepository(eventStore);
    const movieRepository = new MovieRepository(eventStore, roundGenerator);
    const quizRepository = new QuizRepository(eventStore, roundGenerator);

    const roomService = new RoomService(roomRepository, roomCollection, permissionRepository, championshipRepository, commandBus);
    const championshipService = new ChampionshipService(championshipRepository, permissionRepository, commandBus);
    const movieService = new MovieService(commandBus, permissionRepository);
    const quizService = new QuizService(commandBus, permissionRepository, quizRepository);

    commandBus
        .addHandler(AddParticipantCommand, new AddParticipantHandler(championshipRepository))
        .addHandler(RemoveParticipantCommand, new RemoveParticipantHandler(championshipRepository))
        .addRPCHandler(AddJudgeCommand, new AddJudgeHandler(championshipRepository, permissionRepository))
        .addHandler(RemoveJudgeCommand, new RemoveJudgeHandler(championshipRepository))
        .addHandler(SetJudgeReadyCommand, new SetJudgeReadyHandler(championshipRepository))
        .addHandler(StartChampionshipCommand, new StartChampionshipHandler(championshipRepository))
        .addHandler(LikeParticipantCommand, new LikeParticipantHandler(championshipRepository))
        .addHandler(VoteInParticipantCommand, new VoteInParticipantHandler(championshipRepository))
        .addHandler(RestartChampionshipCommand, new RestartChampionshipHandler(championshipRepository))
        .addHandler(KickClientCommand, new KickClientCommandHandler(roomRepository, championshipRepository, permissionRepository))
        .addHandler(ValidateChampionshipCommand, new ValidateChampionshipHandler(roomRepository, championshipRepository, permissionRepository))
        .addHandler(GenerateMovieParticipants, new GenerateMovieParticipantsHandler(movieRepository, championshipRepository, new MovieData()))
        .addRPCHandler(ReadyQuizCommand, new ReadyQuizHandler(championshipRepository, quizRepository))
        .addHandler(MultipleQuizCommand, new MultipleQuizHandler(championshipRepository, quizRepository));

    eventBus
        .addHandler(ChampionshipUpdated, new ChampioshipUpdatedHandler(roomService))
        .addHandler(RoomClientKickEvent, new RoomKickEventHandler(roomService));

    const apiController = new ApiController(roomService, championshipService);
    const movieController = new MovieController(movieService);
    const quizController = new QuizController(quizService);
    
    app.use(express.json());
    app.use(cookieParser());
    app.use(
        session({
            store: new RedisSession({ client: redisClient }),
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        })
    );


    app.post('/championship/create', asyncHandler(apiController.createChampionship.bind(apiController)));
    app.post('/championship/:roomID/participant/create', asyncHandler(apiController.addParticipantInChampionship.bind(apiController)));
    app.post('/championship/:roomID/participant/:participantID/remove', asyncHandler(apiController.removeParticipantFromChampionship.bind(apiController)));
    app.post('/championship/:roomID/participant/like', asyncHandler(apiController.likeParticipant.bind(apiController)));
    app.get('/championship/:roomID/invite/:invite', asyncHandler(apiController.enterWithInvite.bind(apiController)));
    app.post('/championship/:roomID/invite/create', asyncHandler(apiController.getInviteLink.bind(apiController)));
    app.post('/championship/:roomID/vote', asyncHandler(apiController.voteInParticipant.bind(apiController)));
    app.post('/championship/:roomID/start', asyncHandler(apiController.startChampionship.bind(apiController)));
    app.post('/championship/:roomID/restart', asyncHandler(apiController.restartChampionship.bind(apiController)));
    app.post('/championship/:roomID/subscribe', asyncHandler(apiController.enterInChampionshipAsJudge.bind(apiController)));
    app.post('/championship/:roomID/judge/:judgeID/remove', asyncHandler(apiController.removeJudgeFromChampionship.bind(apiController)));
    app.post('/championship/:roomID/ready', asyncHandler(apiController.setJudgeReady.bind(apiController)));
    app.post('/room/:roomID/info', asyncHandler(apiController.championshipInfo.bind(apiController)));
    app.get('/room/:roomID/subscribe', asyncHandler(apiController.subscribeToRoom.bind(apiController)));

    app.post('/movie-championship/:roomID/reroll', asyncHandler(movieController.reroll.bind(movieController)));
    app.post('/movie-championship/:roomID/start', asyncHandler(movieController.prepareChampionship.bind(movieController)));

    app.post('/quiz-championship/:roomID/ready', asyncHandler(quizController.readyQuiz.bind(quizController)));
    app.post('/quiz-championship/create', asyncHandler(quizController.createQuiz.bind(quizController)));

    app.get('/redis', (req: any, res: any) => {
        redisClient.keys('*', (err, keys) => {
            res.json({
                keys
            });
        })
    });

    app.get('/stats/championship/:id', (req: any, res: any) => {
        championshipRepository.get(req.params.id).then((championship) => {
            res.json(championship.getState());
        });
    });

    app.get('/stats/room/:id', (req: any, res: any) => {
        roomRepository.get(req.params.id).then((room) => {
            res.json({
                clients: room.getClients(),
                clientsToRemove: room.getClientsToRemove(),
                clientsToDisconnect: room.getClientsToDisconnect(),
                isEmpty: room.isEmpty()
            });
        });
    });

    app.get('/stats/room/events/:id', (req: any, res: any) => {
        roomRepository.getEvents(req.params.id).then((events) => {
            res.json(events);
        });
    });

    app.use((err: any, req: any, res: any, next: any) => {
        res.status(500).json({
            message: err.message
        });
    });

    return app;
}

const app = bootstrap(express());
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`RUN TO THE HILLS http://localhost:${PORT}`));