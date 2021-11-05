import { RoomService } from "../services/room/room.service";
import { ChampionshipService } from "../services/championship/championship.service";
import { Response } from "express";
import { RequestWithSession } from "../core/modules/interfaces";

export class ApiController {
    private roomService: RoomService;
    private championshipService: ChampionshipService;

    constructor(roomService: RoomService, championshipService: ChampionshipService) {
        this.roomService = roomService;
        this.championshipService = championshipService;
    }

    getSessionToken(req: RequestWithSession) {
        return req.session.token;
    }

    setSessionToken(req: RequestWithSession, token: string) {
        req.session.token = token;
    }

    resetSession(req: RequestWithSession) {
        req.session.destroy();
    }

    async createChampionship(req: RequestWithSession, res: Response) {
        const { token, championshipID } = await this.championshipService.createChampionship(req.body.type);
        this.setSessionToken(req, token);
        return res.json({ roomID: championshipID, success: true });
    }

    async enterWithInvite(req: RequestWithSession, res: Response) {
        const { invite, roomID } = req.params;

        await this.championshipService.validateInviteToken({
            championshipID: req.params.roomID,
            token: invite
        });

        this.setSessionToken(req, invite);
        
        return res.redirect(`/#/${roomID}`);
    }

    async getInviteLink(req: RequestWithSession, res: Response) {
        const { link } = await this.championshipService.generateAnInviteLink({
            championshipID: req.params.roomID,
            token: this.getSessionToken(req),
        });

        return res.json({
            link,
            success: true
        });
    }

    async enterInChampionshipAsJudge(req: RequestWithSession, res: Response) {
        const { token } = await this.championshipService.enterInChampionshipAsJudge({
            championshipID: req.params.roomID,
            judge: req.body.judge,
            token: this.getSessionToken(req),
        });

        this.setSessionToken(req, token);
        
        return res.json({
            success: true
        });
    }

    async addParticipantInChampionship(req: RequestWithSession, res: Response) {
        const championshipID = req.params.roomID;
        const { participant } = req.body;

        const newParticipant = await this.championshipService.addParticipantInChampionship({ championshipID, participant, token: this.getSessionToken(req) });

        return res.json({
            success: true,
            participantID: newParticipant.participantID
        });
    }

    async removeParticipantFromChampionship(req: RequestWithSession, res: Response) {
        const { roomID, participantID } = req.params;

        await this.championshipService.removeParticipantFromChampionship({ championshipID: roomID, participantID, token: this.getSessionToken(req) });

        return res.json({
            success: true,
            participantID
        });
    }

    async removeJudgeFromChampionship(req: RequestWithSession, res: Response) {
        const { roomID, judgeID } = req.params;

        await this.roomService.kickClient({
            roomID,
            judgeID,
            token: this.getSessionToken(req),
        })

        return res.json({
            success: true
        });
    }

    async voteInParticipant(req: RequestWithSession, res: Response) {
        const roomID = req.params.roomID;
        const { participant } = req.body;

        await this.championshipService.voteInParticipant({
            championshipID: roomID,
            participantID: participant.participantID,
            token: this.getSessionToken(req),
        });

        return res.json({
            success: true,
            roomID
        });
    }

    async likeParticipant(req: RequestWithSession, res: Response) {
        const roomID = req.params.roomID;
        const { participantID } = req.body;

        await this.championshipService.likeParticipant({
            championshipID: roomID,
            participantID: participantID,
            token: this.getSessionToken(req),
        });

        return res.json({
            success: true,
            roomID
        });
    }

    async startChampionship(req: RequestWithSession, res: Response) {

        await this.championshipService.startChampionship({
            championshipID: req.params.roomID,
            token: this.getSessionToken(req)
        })

        return res.json({
            success: true
        });
    }

    async restartChampionship(req: RequestWithSession, res: Response) {
        await this.championshipService.restartChampionship({
            championshipID: req.params.roomID,
            token: this.getSessionToken(req)
        });

        return res.json({
            success: true
        });
    }

    async championshipInfo(req: RequestWithSession, res: Response) {
        try {
            const meta = await this.championshipService.getChampionshipMeta({
                championshipID: req.params.roomID,
                token: this.getSessionToken(req)
            });

            return res.json({
                hasChampionship: true,
                isAJudge: meta.isAJudge,
                canEnter: meta.canEnter
            });
        } catch (e) {
            this.resetSession(req);
            throw e;
        }
    }

    async setJudgeReady(req: RequestWithSession, res: Response) {
        await this.championshipService.setJudgeReady({
            championshipID: req.params.roomID,
            token: this.getSessionToken(req)
        });

        return res.json({
            success: true
        });
    }

    async subscribeToChampinshipRoom({ roomID, token, observable, prepare }: any) {
        return this.roomService.subscribeToRoom({
            roomID,
            clientID: token,
            prepare,
            observable,
            update: this.championshipService.getChampionshipInfo.bind(this.championshipService, { championshipID: roomID, token })
        });
    }

    async subscribeToRoom(req: RequestWithSession, res: Response) {
        const roomID = req.params.roomID;

        console.log('Start');

        try {
            const connection = await this.subscribeToChampinshipRoom({
                roomID,
                token: this.getSessionToken(req),
                observable: {
                    next: (data: any) => {
                        res.write(`event: data\ndata: ${JSON.stringify(data)}\n\n`);
                    },
                    error: (e: Error) => {
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
            
            this.resetSession(req);

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