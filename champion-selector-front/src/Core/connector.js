import Notification from './notification';
import axios from 'axios';
import { Connector } from 'champion-selector-connector';

class ConnectorBridge {
    constructor(connector, notificationClient) {
        this.EVENTS_URL = '/events';
        this.connector = connector;
        this.notificationClient = notificationClient;
        this.subscribeToChampionship = this.subscribeToChampionship.bind(this);
    }

    createChampionship() {
        return this.connector.createChampionship();
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
        const eventSource = new EventSource(`${this.EVENTS_URL}/room/${championshipID}/subscribe`)
    
            eventSource.addEventListener('data', (event) => {
                try {
                    observer.next(JSON.parse(event.data));
                } catch (e) {
                    observer.error(e);
                }
            });

            eventSource.addEventListener('error', (e) => {
                eventSource.close();
                console.log('clientError: ', e);
            });

            eventSource.addEventListener('serverError', (event) => {
                eventSource.close();

                console.log('serverError: ', event);

                try {
                    observer.error(JSON.parse(event.data));
                } catch (e) {
                    observer.error(e);
                }
            });

            return () => {
                console.log('unsubscribe');
                eventSource.close();
            }
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
}

export default new ConnectorBridge(new Connector({ httpClient: axios, serverURL: '/back' }), Notification);