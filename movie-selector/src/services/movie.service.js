

export class MovieService {
    constructor(movieRepository) {
        this.movieRepository = movieRepository;
    }

    getRandomInteger(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    sanitizeThumb(thumb) {
        const fileName = thumb.split('/').pop();
        let sanitize = fileName.split('@@._V1_');
        if (sanitize.length === 1) sanitize = fileName.split('@._V1_');
        if (sanitize.length === 1) sanitize = fileName.split('._V1_');
        return `${sanitize[0]}.jpg`;
    }

    getRandomMovieByGenre({ genre, quantity = 10 }) {
        return this.movieRepository.getMovieByGenre({ genre }).then((movieList) => {
            const result = [];
            const listLength = movieList.length;

            for (let i = 0; i < quantity; i++) {
                let item = movieList[this.getRandomInteger(0, listLength)];
                let exaust = 0;
    
                while(result.some((u) => u && u.name === item.name) && exaust < 20) {
                    item = movieList[this.getRandomInteger(0, listLength)];
                    exaust = exaust + 1;
                }
    
                result.push(item);
            }
    
            return Promise.resolve(result.map((movie) => Object.assign({}, movie, { thumb: this.sanitizeThumb(movie.thumb) })));
        });
    }
}