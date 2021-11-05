export class Connector {
    constructor({ httpClient, serverURL }) {
        this.SERVER_URL = serverURL || '/back';
        this.httpClient = httpClient;
    }

    createChampionship(config) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/create`, config)
                .then(({data}) => {
                    if (data.success) {
                        resolve(data.roomID);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    getChampionshipInfo({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/room/${championshipID}/info`)
                .then(({ data }) => {
                    resolve(data);
                }).catch(({ response }) => {
                    reject(response.data.message);
                });
        });
    }

    enterInChampionship({ championshipID, judge }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/subscribe`, { judge })
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    addParticipantInChampionship({ championshipID, participantName }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/participant/create`, { participant: { text: participantName }})
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    removeParticipantFromChampionship({ championshipID, participantID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/participant/${participantID}/remove`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    removeJudgeFromChampionship({ championshipID, judgeID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/judge/${judgeID}/remove`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    voteInParticipant({ championshipID, participant }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/vote`, { participant })
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    likeParticipant({ championshipID, participantID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/participant/like`, { participantID })
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    generateInvite({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/invite/create`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.link);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    readyQuiz({ championshipID, questions }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/quiz-championship/${championshipID}/ready`, { questions })
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    createQuiz(config) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/quiz-championship/create`, config)
                .then(({data}) => {
                    if (data.success) {
                        resolve(data.roomID);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    startChampionship({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/start`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    restartChampionship({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/restart`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    judgeIsReady({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/championship/${championshipID}/ready`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    rerollMovieList({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/movie-championship/${championshipID}/reroll`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }

    startMovieChampionship({ championshipID }) {
        return new Promise((resolve, reject) => {
            this.httpClient.post(`${this.SERVER_URL}/movie-championship/${championshipID}/start`)
                .then(({ data }) => {
                    if (data.success) {
                        resolve(data.success);
                    } else {
                        reject(new Error('An error has ocurred'));
                    }
                })
                .catch(reject);
        });
    }
}