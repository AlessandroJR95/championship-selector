import { RequestWithSession } from "../../../core/modules/interfaces";
import { Response } from "express";
import { QuizService } from "../services/quiz.service";

export class QuizController {
    private quizService: QuizService;

    constructor(quizService: QuizService) {
        this.quizService = quizService;
    }

    getSessionToken(req: RequestWithSession) {
        return req.session.token;
    }

    setSessionToken(req: RequestWithSession, token: string) {
        req.session.token = token;
    }

    async readyQuiz(req: RequestWithSession, res: Response) {
        await this.quizService.readyQuiz({ 
            championshipID: req.params.roomID,
            questions: req.body.questions,
            token: this.getSessionToken(req) 
        });

        res.json({
            success: true
        });
    }

    async createQuiz(req: RequestWithSession, res: Response) {
        const { token, championshipID } = await this.quizService.createQuiz({
            type: req.body.type,
            multiple: req.body.multiple
        });

        this.setSessionToken(req, token);

        return res.json({ roomID: championshipID, success: true });
    }
}