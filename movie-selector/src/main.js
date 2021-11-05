import express from 'express';
import fs from 'fs';
import path from 'path';
import { MovieController } from './controllers/movie.controller';
import { MovieService } from './services/movie.service';
import { MovieRepository } from './repositories/movie.repository';

const PORT = 9090;

process.on('uncaughtException', err => {
    fs.appendFile(path.join(process.env.LOG_PATH, 'error.log'), `${err.message}\n${err.stack}`, (err) => {
        if (err) console.error(err); 
        console.log('Log created');
    });
});

function bootstrap(app) {
    const movieRepository = new MovieRepository();
    const movieService = new MovieService(movieRepository);
    const movieController = new MovieController(movieService);

    app.get('/byGenre/:genre', movieController.byGenre.bind(movieController));

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