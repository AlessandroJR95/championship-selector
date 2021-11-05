import Notification from './notification';
import axios from 'axios';
import { Connector } from 'champion-selector-connector';

class EventSourceBridge {
    constructor(observer) {
        this.observer = observer;
        this.eventSource = null;
        this.MAX_RETRY = 10;
        this.reconnectionRetries = 0;
        this.retrying = false;

        this.handleData = this.handleData.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleServerError = this.handleServerError.bind(this);
        this.notifyError = this.notifyError.bind(this);
    }

    static of(observer) {
        return new EventSourceBridge(observer);
    }

    retryConnection() {
        if (!this.retrying) {
            this.retrying = true;
            setTimeout(() => {
                this.unsubscribe();
                this.connect(this.eventSource.url);
                this.retrying = false;
            }, this.reconnectionRetries * 1000);
        }
    }

    handleData(event) {
        try {
            this.observer.next(JSON.parse(event.data));
            this.reconnectionRetries = 0;
        } catch (e) {
            this.notifyError(e);
        }
    }

    handleError(error) {
        this.reconnectionRetries = this.reconnectionRetries + 1;

        if (error.target.readyState === 2) {
            this.retryConnection();
        }

        if (this.reconnectionRetries > this.MAX_RETRY) {
            this.eventSource.close();
        }

        this.notifyDisconnection(error);
    }

    handleServerError(event) {
        this.eventSource.close();

        try {
            this.notifyError(JSON.parse(event.data));
        } catch (e) {
            this.notifyError(e);
        }
    }

    notifyError(err) {
        this.observer.error(err);
    }

    notifyDisconnection() {
        this.observer.disconnection(this.reconnectionRetries);
    }

    addEvents() {
        this.removeEvents();
        this.eventSource.addEventListener('data', this.handleData);
        this.eventSource.addEventListener('error', this.handleError);
        this.eventSource.addEventListener('serverError', this.handleServerError);
    }

    removeEvents() {
        this.eventSource.removeEventListener('data', this.handleData);
        this.eventSource.removeEventListener('error', this.handleError);
        this.eventSource.removeEventListener('serverError', this.handleServerError);
    }

    connect(url) {
        this.eventSource = new EventSource(url);
    
        this.addEvents();

        return () => {
            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.removeEvents();
        this.eventSource.close();
    }
}

class ConnectorBridge {
    constructor(connector, notificationClient) {
        this.EVENTS_URL = '/events';
        this.connector = connector;
        this.notificationClient = notificationClient;
        this.subscribeToChampionship = this.subscribeToChampionship.bind(this);
    }

    createChampionship(config) {
        return this.connector.createChampionship(config);
    }

    getChampionshipInfo({ championshipID }) {
        return this.connector.getChampionshipInfo({ championshipID });
    }

    enterInChampionship({ championshipID, judge }) {
        return this.connector.enterInChampionship({ championshipID, judge })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    connectToEventSource({ championshipID, observer }) {
        return EventSourceBridge.of({
            next: (data) => {
                observer.next(data);
            },
            error: observer.error.bind(observer),
            disconnection: (retries) => {
                this.notificationClient.error(`Você foi desconectado, reconectando... ${retries}`);
            }
        }).connect(`${this.EVENTS_URL}/room/${championshipID}/subscribe`);
    }

    subscribeToChampionship({ championshipID, judge, reconnection, observer }) {
        if (reconnection) {
            this.connectToEventSource({ championshipID, observer });
        } else {
            this.enterInChampionship({ championshipID, judge })
                .then(() => {
                    this.connectToEventSource({ championshipID, observer });
                }).catch((err) => {
                    observer.error(err);
                });
        }
    }

    addParticipantInChampionship({ championshipID, participantName }) {
        return this.connector.addParticipantInChampionship({ championshipID, participantName })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    removeParticipantFromChampionship({ championshipID, participantID }) {
        return this.connector.removeParticipantFromChampionship({ championshipID, participantID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    removeJudgeFromChampionship({ championshipID, judgeID }) {
        return this.connector.removeJudgeFromChampionship({ championshipID, judgeID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    voteInParticipant({ championshipID, participant }) {
        return this.connector.voteInParticipant({ championshipID, participant })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    startChampionship({ championshipID }) {
        return this.connector.startChampionship({ championshipID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    readyQuiz({ championshipID, questions }) {
        return this.connector.readyQuiz({ championshipID, questions })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    createQuiz(config) {
        return this.connector.createQuiz(config);
    }

    restartChampionship({ championshipID }) {
        return this.connector.restartChampionship({ championshipID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    judgeIsReady({ championshipID }) {
        return this.connector.judgeIsReady({ championshipID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    rerollMovieList({ championshipID }) {
        return this.connector.rerollMovieList({ championshipID })
            .catch(({ response }) => {
            this.notificationClient.error(response.data.message);
        });
    }

    likeParticipant({ championshipID, participantID }) {
        return this.connector.likeParticipant({ championshipID, participantID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    generateInvite({ championshipID }) {
        return this.connector.generateInvite({ championshipID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }

    startMovieChampionship({ championshipID }) {
        return this.connector.startMovieChampionship({ championshipID })
            .catch(({ response }) => {
                this.notificationClient.error(response.data.message);
            });
    }
}

export default new ConnectorBridge(new Connector({ httpClient: axios, serverURL: '/back' }), Notification);