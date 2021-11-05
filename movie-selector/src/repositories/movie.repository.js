import path from 'path';
import { readFile, readDir } from '../utils/fs';

const MOVIE_DIR = process.env.MOVIE_DIR;

function concatAll(matrix) {
    return Promise.resolve(Array.prototype.concat.apply([], matrix));
}

export class MovieRepository {
    constructor() {
        this.cached = new Map();
        this.fileList = null;
    }

    loadFileList() {
        return new Promise((resolve, reject) => {
            if (this.fileList) return resolve(this.fileList);

            readDir(MOVIE_DIR, (err, files) => {
                if (err) return reject(err); 
                resolve(this.fileList = files);
            });
        });
    }

    getFilesByGenre(genre, list) {
        return Promise.resolve(list.filter((file) => file.indexOf(genre) > -1));
    }

    loadFile(file) {
        return new Promise((res, rej) => {
            readFile(path.join(MOVIE_DIR, file), 'utf8', (err, data) => {
                if (err) return rej(err);
                
                try {
                    res(JSON.parse(data));
                } catch (e) {
                    rej(e);
                }
            });
        });
    }

    loadList(list) {
        return Promise.all(list.map(this.loadFile)).then(concatAll);
    }

    loadAllGenreInfo(genre) {
        return this.loadFileList()
            .then(this.getFilesByGenre.bind(this, genre))
            .then(this.loadList.bind(this));
    }

    loadMovieInfo(genre) {
        return new Promise((resolve, reject) => {
            if (this.cached.has(genre)) {
                return resolve(this.cached.get(genre));
            }

            this.loadAllGenreInfo(genre)
                .then((data) => {
                    this.cached.set(genre, data);
                    resolve(data);
                }).catch(reject);
        });
    }

    getMovieByGenre({ genre }) {
        return this.loadMovieInfo(genre);
    }
}