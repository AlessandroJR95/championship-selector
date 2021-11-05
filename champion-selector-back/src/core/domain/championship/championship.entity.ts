import { mulberry32, xmur3 } from '../../modules/utils/hash';
import { ChampionshipState, ChampionshipPhase, Participant, Judge, Vote, Round, Like } from "./championship.types";
import { Winner } from './championship.entity.winner';

export class ChampionshipEntity {
    protected state: ChampionshipState;
    PARTICIPANT_LIMIT = 10;

    constructor(state: ChampionshipState) {
        this.state = state;
    }

    static toggleLike(state: ChampionshipState, like: Like) {
        function findJudgeParticipant(like: Like) {
            return (a: Like) => a.judge.judgeID === like.judge.judgeID && a.participant.participantID === like.participant.participantID;
        }

        const filtered = state.likes.filter((a) => !findJudgeParticipant(like)(a));
        const isTooglingLike = state.likes.some(findJudgeParticipant(like));
        const isExceedingLimit = state.likes.filter((a) => a.judge.judgeID === like.judge.judgeID).length > 2;

        if (isTooglingLike) {
            return filtered;
        }

        if (isExceedingLimit) {
            return filtered;
        }

        return filtered.concat(like);
    }

    static addScoreToParticipant(state: ChampionshipState, participant: Participant) {
        const actualScore = new Map([...(state.score || [])]);

        actualScore.set(participant.participantID, (actualScore.get(participant.participantID) || 0) + 1);

        return [...actualScore];
    }

    static removeParticipantFromScore(state: ChampionshipState, participant: Participant) {
        const actualScore = new Map([...(state.score || [])]);

        actualScore.delete(participant.participantID);

        return [...actualScore];
    }

    static calculateInitialScore(state: ChampionshipState) {
        const actualScore = new Map();
        
        state.likes.forEach((like: Like) => {
            actualScore.set(like.participant.participantID, (actualScore.get(like.participant.participantID) || 0) + 5);
        });
        
        return [...actualScore];
    }

    static generateRounds(state: ChampionshipState) {
        const participants = state.participants;
        let rounds = [[]] as Round<Participant>[];

        for (let participant of participants) {
            if (rounds[rounds.length - 1].length > 1) {
                rounds.push([participant]);
            } else {
                rounds[rounds.length - 1].push(participant);
            }
        }

        return rounds;
    }

    static addVote(state: ChampionshipState, vote: Vote) {
        const allVotes = state.votes;
        const currentRound = state.round;
        const votes = allVotes[currentRound];
        const newVotes = votes.concat(vote);
        
        return [
            ...allVotes.slice(0,  currentRound),
            newVotes,
            ...allVotes.slice(currentRound + 1, allVotes.length)
        ];
    }

    static hasEveryoneVoted(state: ChampionshipState) {
        return state.phase === ChampionshipPhase.START_MATCHUP_VOTE && state.judges.every(
            (judge) => state.votes[state.round].some((vote) => vote.judge.judgeID === judge.judgeID)
        );
    }

    static getRoundWinner(state: ChampionshipState): Winner {
        let winner = null as string;
        let draws = [];

        const voteMap = state.votes[state.round].reduce((voteMap: any, vote: Vote) => {
            voteMap[vote.participant.participantID] = !voteMap[vote.participant.participantID] ? 1 : voteMap[vote.participant.participantID] + 1;
            return voteMap;
        }, {});

        for (let participant in voteMap) {
            if (voteMap[participant] > (voteMap[winner] || 0)) {
                winner = participant;
            }
        }

        if (winner) {
            for (let participant in voteMap) {
                if (voteMap[participant] === voteMap[winner]) {
                    draws.push(participant);
                }
            }
                
            if (draws.length > 1) {
                winner = ChampionshipEntity.randomizeWinner(`${state.seed}${state.round}`, draws);
            }

            return new Winner(ChampionshipEntity.findParticipant(state, winner)).calculateBadges({
                votes: state.votes[state.round],
                winnerVotes: state.votes[state.round].filter((vote) => vote.participant.participantID === winner),
                judges: state.judges
            });
        }

        return null;
    }

    static findParticipant(state: ChampionshipState, id: string) {
        return state.participants.find((p) => String(p.participantID) === String(id));
    }

    static randomizeWinner(seed: string, drawList: any) {
        const randomIndex = Math.floor((mulberry32(xmur3(seed)())() * drawList.length));

        return drawList[randomIndex];
    }

    static updateJudge(state: ChampionshipState, judgeID: string, data: any) {
        return state.judges.map((j) => {
            if (j.judgeID === judgeID) {
                Object.assign(j, data);
            }

            return j;
        });
    }

    static getUnreadyJudges(state: ChampionshipState) {
        return state.judges.map((judge) => Object.assign({}, judge, { ready: false }));
    }

    getState() {
        return {
            phase: this.state.phase,
            judges: this.state.judges,
            participants: this.state.participants,
            round: this.state.round,
            rounds: this.state.rounds,
            votes: this.state.votes,
            winners: this.state.winners,
            generator: this.state.generator,
            score: this.state.score,
            likes: this.state.likes
        };
    }

    getLikes() {
        return this.state.likes;
    }

    getScore() {
        return this.state.score;
    }

    getPhase(): ChampionshipPhase {
        return this.state.phase;
    }

    getJudges(): Judge[] {
        return this.state.judges;
    }

    getCurrentVotes(): Vote[] {
        return this.state.votes[this.state.round];
    }

    findJudge(id: string): Judge {
        return this.getJudges().find((judge) => judge.judgeID === id);
    }

    isJudgeReady(id: string): boolean {
        return Boolean((this.findJudge(id) || {}).ready);
    }

    isInPreparationPhase(): boolean {
        return this.getPhase() === ChampionshipPhase.PREPARATION;
    }

    isInFinishPhase(): boolean {
        return this.getPhase() === ChampionshipPhase.FINISH_CHAMPIONSHIP;
    }

    isInVotingPhase(): boolean {
        return this.getPhase() === ChampionshipPhase.START_MATCHUP_VOTE;
    }

    hasEnoughJudges(): boolean {
        return Boolean(this.getJudges().length);
    }

    hasEnoughParticipants(): boolean {
        return Boolean(this.getParticipants().length > 1);
    }

    hasParticipantAlready(participant: Participant): boolean {
        return this.getParticipants().some((p) => JSON.stringify(p.data) === JSON.stringify(participant.data));
    }

    getJudgeParticipants(judgeID: string): Participant[] {
        return this.getParticipants().filter((p) => p.judgeID === judgeID);
    }

    hasJudgeAreadyVoted(judgeID: string): boolean {
        return this.getCurrentVotes().some((a) => a.judge.judgeID === judgeID);
    }

    isParticipantInCurrentRound(participantID: string) {
        return this.getCurrentRound().some((round) => round.participantID === participantID);
    }

    getJudgesThatHaveVoted() {
        return this.getCurrentVotes().map((vote) => vote.judge.judgeID);
    }

    getWinner(): Winner {
        return this.state.winners[this.state.winners.length - 1];
    }

    getLastRoundWinner(): Winner {
        return this.state.winners[this.state.round - 1];
    }

    getCurrentRound(): Round<Participant> {
        return this.state.rounds[this.state.round];
    }

    getCurrentRoundIndex(): number {
        return this.state.round;
    }

    getVotes(): Vote[][] {
        return this.state.votes;
    }

    getParticipants(): Participant[] {
        return this.state.participants;
    }

    getWinners(): Winner[] {
        return this.state.winners;
    }

    hasAllJudgesReady(): boolean {
        const actualJudges = this.getJudges(); 
        const judgesReady = actualJudges.filter((judge) => Boolean(judge.ready));
        return (actualJudges.length - 1) <= judgesReady.length; 
    }

    hasReachParticipantLimit(judgeID: string) {
        return this.getJudgeParticipants(judgeID).length > this.PARTICIPANT_LIMIT;
    }

    hasReachLikeLimit(judgeID: string, participantID: string) {
        return this.getLikes().filter((like: Like) => like.judge.judgeID === judgeID && like.participant.participantID !== participantID).length > 2;
    }
}