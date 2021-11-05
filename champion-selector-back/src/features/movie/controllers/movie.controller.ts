import { MovieService } from "../services/movie.service";
import { RequestWithSession } from "../../../core/modules/interfaces";
import { Response } from "express";

export class MovieController {
    private movieService: MovieService;

    constructor(movieService: MovieService) {
        this.movieService = movieService;
    }

    getSessionToken(req: RequestWithSession) {
        return req.session.token;
    }

    async reroll(req: RequestWithSession, res: Response) {
        await this.movieService.rerollMovieList({ championshipID: req.params.roomID, token: this.getSessionToken(req) });

        res.json({
            success: true
        });
    }

    async prepareChampionship(req: RequestWithSession, res: Response) {
        await this.movieService.prepareChampionship({
            championshipID: req.params.roomID,
            token: this.getSessionToken(req)
        });

        res.json({
            success: true
        });
    }
}