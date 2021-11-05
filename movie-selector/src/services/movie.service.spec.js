import * as FSUtils from '../utils/fs';
import { MovieService } from './movie.service';
import { MovieRepository } from '../repositories/movie.repository';

describe('MovieService tests', () => {
    let movieRepository;
    let movieService;

    beforeEach(() => {
        movieRepository = new MovieRepository();
        movieService = new MovieService(movieRepository);

        jest.spyOn(movieService, 'getRandomInteger')
            .mockImplementationOnce(() => 0)
            .mockImplementationOnce(() => 1);
    });

    it('should cache movie data from fs', async () => {
        const callCount = jest.spyOn(movieRepository, 'loadAllGenreInfo');
        const fsCallCount = jest.spyOn(FSUtils, 'readDir');
        let randomMovies = await movieService.getRandomMovieByGenre({ genre: 'mock', quantity: 2 });
        randomMovies = await movieService.getRandomMovieByGenre({ genre: 'mock', quantity: 2 });
        randomMovies = await movieService.getRandomMovieByGenre({ genre: 'mock', quantity: 2 });
        randomMovies = await movieService.getRandomMovieByGenre({ genre: 'mock', quantity: 2 });

        expect(callCount.mock.calls.length).toEqual(1);
        expect(fsCallCount.mock.calls.length).toEqual(1);
    });
});