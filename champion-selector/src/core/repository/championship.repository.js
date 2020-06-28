import { Championship } from '../entity/championship';
import { generateIDForMap } from '../utils/hash';

export class ChampionshipRepository {
    constructor() {
        this.championships = new Map();
    }

    createChampionship() {
        const championshipID = generateIDForMap(this.championships);
        
        this.championships.set(championshipID, {
            championship: new Championship(),
            subscription: null
        });

        return { championshipID };
    }

    getChampionship({ championshipID }) {
        if (!this.championships.has(championshipID)) {
            throw new Error('Championshp not found');
        }

        return this.championships.get(championshipID).championship;
    }

    setChampionshipSubscription({ championshipID, subscription }) {
        if (this.championships.has(championshipID)) {
            this.championships.get(championshipID).subscription = subscription;
        }
    }

    unsubscribeFromChampionship({ championshipID }) {
        if (this.championships.has(championshipID)) {
            this.championships.get(championshipID).subscription.unsubscribe();
        }
    }

    subscribeToChampionship({ championshipID, observable }) {
        this.setChampionshipSubscription({
            championshipID,
            subscription: this.getChampionship({ championshipID }).subscribe(
                observable.next,
                observable.error,
                observable.complete
            )
        });
    }

    addJudgeToChampionship({ championshipID, judge }) {
        const championship = this.getChampionship({ championshipID });
        const judgeID = generateIDForMap(new Map(championship.getJudges().map((j) => [j.id, true])));

        championship.addJudge({
            name: judge.name,
            icon: judge.icon,
            isReady: judge.isReady,
            id: judgeID
        });

        return { judgeID };
    }

    removeJudgeFromChampionship({ championshipID, judgeID }) {
        const championship = this.getChampionship({ championshipID });
        championship.removeJudge(judgeID);
    }

    setReadyJudge({ championshipID, judgeID }) {
        const championship = this.getChampionship({ championshipID });
        championship.updateJudge(judgeID, { isReady: true });
    }

    allJudgesReady({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        const actualJudges = championship.getJudges(); 
        const judgesReady = actualJudges.filter((judge) => Boolean(judge.isReady));
        return (actualJudges.length - 1) <= judgesReady.length;
    }

    getJudgesThatHaveVoted({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getCurrentVotes().map((vote) => vote.judgeID);
    }

    isJudgeReady({ championshipID, judgeID }) {
        const judge = this.findJudge({ championshipID, judgeID });
        return judge ? judge.isReady : false;
    }

    getJudges({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getJudges();
    }

    startChampionship({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        championship.start();
    }

    restartChampionship({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        championship.restart();
        this.unreadyJudges({ championshipID });
    }

    unreadyJudges({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        championship.getJudges().forEach((judge) => championship.updateJudge(judge.id, { isReady: false }));
    }

    addParticipantInChampionship({ championshipID, judgeID, participant }) {
        const championship = this.getChampionship({ championshipID });
        const participantID = generateIDForMap(new Map(championship.getParticipants().map((j) => [j.id, true])));

        championship.addParticipant({
            text: participant.text,
            participantID,
            judgeID
        });

        return { participantID };
    }

    removeParticipantFromChampionship({ participantID, championshipID }) {
        const championship = this.getChampionship({ championshipID });
        championship.removeParticipant(participantID);
    }

    voteInParticipant({ championshipID, judgeID, participant }) {
        const championship = this.getChampionship({ championshipID });
        championship.vote({ judgeID, participant });
    }

    isInPreparationPhase({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getState().phase === 'PREPARATION';
    }

    isInFinishPhase({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getState().phase === 'FINISH_CHAMPIONSHIP';
    }

    isInVotingPhase({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getState().phase === 'START_MATCHUP_VOTE';
    }

    hasEnoughJudges({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return Boolean(championship.getJudges().length);
    }

    hasEnoughParticipants({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return Boolean(championship.getParticipants().length > 1);
    }

    hasParticipantAlready({ championshipID, participant }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getParticipants().some((p) => p.text === participant.text);
    }

    getJudgeParticipants({ championshipID, judgeID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getParticipants().filter((p) => p.judgeID === judgeID);
    }

    hasJudgeAreadyVoted({ championshipID, judgeID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getCurrentVotes().some((a) => a.judgeID === judgeID);
    }

    getWinner({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getWinner();
    }

    getLastRoundWinner({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getWinners()[championship.getLastRoundIndex()];
    }

    findJudge({ championshipID, judgeID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getJudges().find((judge) => judge.id === judgeID);
    }

    getCurrentRound({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getCurrentRound();
    }

    getParticipants({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getParticipants();
    }

    getVotes({ championshipID }) {
        const championship = this.getChampionship({ championshipID });
        return championship.getVotes();
    }

    remove({ championshipID }) {
        this.unsubscribeFromChampionship({ championshipID });
        this.championships.delete(championshipID);
    }
}