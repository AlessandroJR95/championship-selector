import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import { ApiController } from './controller/api.controller';
import { MetricsController } from './controller/metrics.controller';
import { GameService } from './core/service/game.service';
import { ChampionshipRepository } from './core/repository/championship.repository';
import { RoomRepository } from './core/repository/room.repository';
import { RoomChampionshipRepository } from './core/repository/roomchampionship.repository';
import { PermissionRepository } from './core/repository/permission.repository';
import { JudgeTokenRepository } from './core/repository/judgetoken.repository';
import { ClientInfoService } from './core/service/client.info.service';

const PORT = 8080;

console.log("Theres no greater power");

process.on('uncaughtException', err => {
    fs.appendFile(path.join(process.env.LOG_PATH, 'error.log'), `${err.message}\n${err.stack}`, (err) => {
        if (err) console.error(err); 
        console.log('Log created');
    });
});

function bootstrap(app) {
    const permissionRepository = new PermissionRepository();
    const roomChampionshipRepository = new RoomChampionshipRepository();
    const roomRepository = new RoomRepository();
    const championshipRepository = new ChampionshipRepository();
    const judgeTokenRepository = new JudgeTokenRepository();

    app.use(express.json());
    app.use(cookieParser());
    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            cookie: {},
            resave: false,
            saveUninitialized: false
        })
    );

    const clientInfoService = new ClientInfoService(
        championshipRepository,
        permissionRepository,
        roomChampionshipRepository,
        judgeTokenRepository
    );

    const gameService = new GameService(
        championshipRepository,
        roomRepository,
        permissionRepository,
        roomChampionshipRepository,
        judgeTokenRepository,
        clientInfoService
    );

    const apiController = new ApiController(gameService);

    const metricsController = new MetricsController(
        championshipRepository,
        roomRepository,
        permissionRepository,
        roomChampionshipRepository,
        judgeTokenRepository
    );

    app.post('/championship/create', apiController.createChampionship.bind(apiController));
    app.post('/championship/:roomID/participant/create', apiController.addParticipantInChampionship.bind(apiController));
    app.post('/championship/:roomID/participant/:participantID/remove', apiController.removeParticipantFromChampionship.bind(apiController));
    app.post('/championship/:roomID/vote', apiController.voteInParticipant.bind(apiController));
    app.post('/championship/:roomID/start', apiController.startChampionship.bind(apiController));
    app.post('/championship/:roomID/restart', apiController.restartChampionship.bind(apiController));
    app.post('/championship/:roomID/subscribe', apiController.enterInChampionshipAsJudge.bind(apiController));
    app.post('/championship/:roomID/judge/:judgeID/remove', apiController.removeJudgeFromChampionship.bind(apiController));
    app.post('/championship/:roomID/ready', apiController.setJudgeReady.bind(apiController));
    app.post('/room/:roomID/info', apiController.championshipInfo.bind(apiController));
    app.get('/room/:roomID/subscribe', apiController.subscribeToRoom.bind(apiController));
    app.get('/metrics', metricsController.getMetrics.bind(metricsController));

    app.use((error, req, res, next) => {
        res.status(500).json({
            message: error.message
        });

        next(error);
    });

    return app;
}

const app = bootstrap(express());

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`));