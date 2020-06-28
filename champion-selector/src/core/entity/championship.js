import { BehaviorSubject, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Winner } from './winner';

export class Championship {
    constructor() {
        this.subject = new BehaviorSubject({
            phase: 'PREPARATION',
            judges: [],
            participants: [],
            round: 0,
            rounds: [[]],
            votes: [[]],
            winners: []
        });

        this.proxySubject = new BehaviorSubject(this.subject.value);
        this.queue = new Subject();

        this.queue.subscribe(
            (action) => {
                try {
                    switch (action.type) {
                        case 'START_CHAMPIONSHIP':
                            this.setState({
                                phase: 'START_MATCHUP_VOTE',
                                rounds: this.generateRounds(),
                                round: 0,
                            });
                            break;
                        case 'RESTART_CHAMPIONSHIP':
                            this.setState({
                                phase: 'PREPARATION',
                                participants: [],
                                round: 0,
                                rounds: [[]],
                                votes: [[]],
                                winner: null,
                                winners: []
                            });
                            break;
                        case 'VOTE_IN_PARTICIPANT':
                            const allVotes = this.getVotes();
                            const currentRound = this.getRoundIndex();
                            const votes = allVotes[currentRound];
                            const newVotes = votes.concat({ judgeID: action.payload.judgeID, participant: action.payload.participant });
                            
                            this.setState({
                                votes: [
                                    ...allVotes.slice(0,  currentRound),
                                    newVotes,
                                    ...allVotes.slice(currentRound + 1, allVotes.length)
                                ]
                            });
                            break;
                        case 'ADD_PARTICIPANT':
                            this.setState({ participants: [action.payload.participant, ...this.getParticipants()] });
                            break;
                        case 'REMOVE_PARTICIPANT':
                            this.setState({ participants: this.getParticipants().filter((p) => p.participantID !== action.payload.participantID) });
                            break;
                        case 'ADD_JUDGE':
                            this.setState({ judges: this.getJudges().concat(action.payload.judge) });
                            break;
                        case 'REMOVE_JUDGE':
                            this.setState({ judges: this.getJudges().filter((judge) => judge.id !== action.payload.judgeID) });
                            break;
                        case 'UPDATE_JUDGE':
                            this.setState({
                                judges: this.getJudges().map((j) => {
                                    if (j.id === action.payload.judgeID) {
                                        Object.assign(j, action.payload.data);
                                    }

                                    return j;
                                })
                            });
                            break;
                        case 'START_NEW_ROUND':
                            const nextRoundIndex = this.getRoundIndex() + 1;
                            const rounds = this.getRounds();
                            const lastRound = rounds[rounds.length - 1];
                            const winner = this.getRoundWinner();
                            const newRoundState = !lastRound || lastRound.length > 1 ? rounds.concat([[winner.participant]]) : [
                                ...rounds.slice(0, -1),
                                [lastRound[0], winner.participant]
                            ];
    
                            const newVoteState = this.getVotes().concat([[]]);
    
                            this.setState({
                                phase: 'START_MATCHUP_VOTE',
                                rounds: newRoundState,
                                round: nextRoundIndex,
                                votes: newVoteState,
                                winners: this.getWinners().concat([winner])
                            });
    
                            break;
                        case 'FINISH_CHAMPIONSHIP':
                            this.setState({ 
                                phase: 'FINISH_CHAMPIONSHIP',
                                winners: this.getWinners().concat([this.getRoundWinner()])
                            });
                            break;
                        case 'END_MATCHUP_VOTE':
                            this.setState({ phase: 'END_MATCHUP_VOTE' });
    
                            break;
                        default:
                            break;
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            (err) => console.log(err),
        );

        this.subject.pipe(tap(this.proxySubject)).subscribe(
            (state) => {
                try {
                    switch (state.phase) {
                        case 'START_MATCHUP_VOTE':
                            const hasEveryoneVoted = state.judges.every(
                                (judge) => state.votes[state.round].some((vote) => vote.judgeID === judge.id)
                            );
    
                            if (hasEveryoneVoted) {
                                this.dispatch({ type: 'END_MATCHUP_VOTE' });
                            }
    
                            break;
                        case 'END_MATCHUP_VOTE':
                            const rounds = this.getRounds();
                            const nextRoundIndex = this.getRoundIndex() + 1;
                            const isFinalRound = rounds.length === nextRoundIndex;

                            if (isFinalRound) {
                                this.dispatch({ type: 'FINISH_CHAMPIONSHIP' });
                            } else {
                                this.dispatch({ type: 'START_NEW_ROUND' });
                            }
                            break;
                        default: 
                            break;
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            (err) => console.log(err),
        );
    }

    generateRounds() {
        const participants = this.getParticipants();
        let rounds = [[]];

        for (let participant of participants) {
            if (rounds[rounds.length - 1].length > 1) {
                rounds.push([participant]);
            } else {
                rounds[rounds.length - 1].push(participant);
            }
        }

        return rounds;
    }

    randomizeWinner(drawList) {
        const randomIndex = Math.floor((Math.random() * drawList.length));

        return drawList[randomIndex];
    }

    dispatch(action) {
        this.queue.next(action);
    }

    getState() {
        return this.proxySubject.value;
    }

    subscribe(next, error, complete) {
        return this.proxySubject.subscribe(next, error, complete);
    }

    getPhase() {
        return this.getState().phase;
    }

    getWinner() {
        return this.getWinners()[this.getWinners().length -1];
    }

    getWinners() {
        return this.getState().winners;
    }

    getRounds() {
        return this.getState().rounds;
    }

    getLastRoundIndex() {
        return this.getRoundIndex() - 1;
    }

    getRoundIndex() {
        return this.getState().round;
    }

    getVotes() {
        return this.getState().votes;
    }

    getCurrentRound() {
        return this.getRounds()[this.getRoundIndex()];
    }

    getCurrentVotes() {
        return this.getState().votes[this.getRoundIndex()];
    }

    getJudges() {
        return this.getState().judges;
    }

    getParticipants() {
        return this.getState().participants;
    }

    getRoundWinner() {
        let winner = null;
        let draws = [];

        const voteMap = this.getCurrentVotes().reduce((voteMap, vote) => {
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
                winner = this.randomizeWinner(draws);
            }

            return new Winner(this.findParticipant(winner)).calculateBadges({ 
                votes: this.getCurrentVotes(),
                winnerVotes: this.getCurrentVotes().filter((vote) => vote.participant.participantID === winner),
                judges: this.getJudges()
            });
        }

        return null;
    }

    findParticipant(id) {
        return this.getParticipants().find((p) => p.participantID === id);
    }

    setState(partialState) {
        this.subject.next(Object.assign({}, this.subject.value, partialState));
    }

    addParticipant(participant) {
        return this.dispatch({ type: 'ADD_PARTICIPANT', payload: { participant }});
    }

    removeParticipant(participantID) {
        return this.dispatch({ type: 'REMOVE_PARTICIPANT', payload: { participantID }});
    }

    addJudge(judge) {
        this.dispatch({ type: 'ADD_JUDGE', payload: { judge }});
    }

    updateJudge(judgeID, data) {
        this.dispatch({ type: 'UPDATE_JUDGE', payload: { judgeID, data }});
    }

    removeJudge(judgeID) {
        this.dispatch({ type: 'REMOVE_JUDGE', payload: { judgeID }});
    }

    restart() {
        return this.dispatch({ type: 'RESTART_CHAMPIONSHIP' });
    }

    start() {
        return this.dispatch({ type: 'START_CHAMPIONSHIP' });
    }

    vote(vote) {
        return this.dispatch({ type: 'VOTE_IN_PARTICIPANT', payload: { participant: vote.participant, judgeID: vote.judgeID }});
    }

}