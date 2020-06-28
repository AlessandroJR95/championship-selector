import { PermissionNotFound } from '../core/exceptions/PermissionNotFound';

export class ApiController {
    constructor(gameService) {
        this.gameService = gameService;
    }

    getSessionToken(req) {
        return req.session.token;
    }

    setSessionToken(req, token) {
        req.session.token = token;
    }

    resetSession(req) {
        req.session.destroy();
    }

    createChampionship(req, res) {
        const { token, roomID, success } = this.gameService.createChampionship();
        this.setSessionToken(req, token);
        return res.json({ roomID, success });
    }

    enterInChampionshipAsJudge(req, res) {
        const { success, token } = this.gameService.enterInChampionshipAsJudge({
            roomID: req.params.roomID,
            judge: req.body.judge,
            token: this.getSessionToken(req),
        });

        this.setSessionToken(req, token);
        
        return res.json({
            success
        });
    }

    addParticipantInChampionship(req, res) {
        const roomID = req.params.roomID;
        const { participant } = req.body;
        return res.json(this.gameService.addParticipantInChampionship({ roomID, participant, token: this.getSessionToken(req) }));
    }

    removeParticipantFromChampionship(req, res) {
        const { roomID, participantID } = req.params;
        return res.json(this.gameService.removeParticipantFromChampionship({ roomID, participantID, token: this.getSessionToken(req) }));
    }

    removeJudgeFromChampionship(req, res) {
        const { roomID, judgeID } = req.params;

        return res.json(
            this.gameService.removeJudgeFromChampionship({
                roomID,
                judgeID,
                token: this.getSessionToken(req),
            })
        );
    }

    voteInParticipant(req, res) {
        const roomID = req.params.roomID;
        const { participant } = req.body;
        return res.json(
            this.gameService.voteInParticipant({
                roomID,
                participant,
                token: this.getSessionToken(req),
            })
        );
    }

    startChampionship(req, res) {
        return res.json(
            this.gameService.startChampionship({
                roomID: req.params.roomID,
                token: this.getSessionToken(req)
            })
        );
    }

    restartChampionship(req, res) {
        return res.json(
            this.gameService.restartChampionship({
                roomID: req.params.roomID,
                token: this.getSessionToken(req)
            })
        );
    }

    championshipInfo(req, res) {
        try {
            return res.json({
                hasChampionship: this.gameService.hasChampionship({
                    roomID: req.params.roomID
                }),
                isAJudge: this.gameService.isAJudge({
                    roomID: req.params.roomID,
                    token: this.getSessionToken(req)
                }),
                canEnter: this.gameService.canEnterInChampionship({
                    roomID: req.params.roomID
                })
            });
        } catch (e) {
            if (e instanceof PermissionNotFound) this.resetSession(req);
            throw e;
        }
    }

    setJudgeReady(req, res) {
        return res.json(
            this.gameService.setJudgeReady({
                roomID: req.params.roomID,
                token: this.getSessionToken(req)
            })
        );
    }

    subscribeToRoom(req, res) {
        const roomID = req.params.roomID;

        console.log('Start');

        try {
            const connection = this.gameService.subscribeToRoom({
                roomID,
                token: this.getSessionToken(req),
                observable: {
                    next: (data) => {
                        res.write(`event: data\ndata: ${JSON.stringify(data)}\n\n`);
                    },
                    error: (e) => {
                        console.log('Error:', roomID, e);
                        res.write(`event: serverError\ndata: ${JSON.stringify({ message: e.message })}\n\n`);
                        res.status(500).end();
                    },
                    complete: () => {
                        console.log('End', roomID);
                        res.status(200).end();
                    },
                },
                prepare: () => {
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Connection': 'keep-alive',
                        'Cache-Control': 'no-cache'
                    });
                }
            });

            req.on('close', () => {
                console.log('Connection closed');
                try {
                    connection.disconnect();
                } catch (e) {
                    console.log('An error has occure while removing subscription: ', e);
                }
            });
        } catch (e) {
            
            if (e instanceof PermissionNotFound) this.resetSession(req);

            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Connection': 'close',
                'Cache-Control': 'no-cache'
            });
            res.write(`event: serverError\ndata: ${JSON.stringify({ message: e.message })}\n\n`);
            res.end();
        }
    }
}