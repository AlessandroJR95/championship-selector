import { Response } from '../dto/response';

export class MovieController {
    constructor(movieService) {
        this.movieService = movieService;
    }

    byGenre(req, res) {
        this.movieService.getRandomMovieByGenre({
            genre: req.params.genre,
            quantity: 10
        }).then((movieList) => {
            res.json(new Response(movieList));
        });
    }
}