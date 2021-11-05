import { IAggregate } from "../../modules/interfaces";
import { ChampionshipEntity } from "./championship.entity";
import { DomainEvent } from "../../modules/event/domain.event";
import { ChampionshipPhase, ChampionshipState, ChampionshipDomainEventType, IRoundGenerator } from "./championship.types";
import { Event } from "../../modules/event/event";

export class ChampionshipAggregate implements IAggregate<ChampionshipEntity> {
    private initialState: any;
    private seed: any;
    private roundGenerator: IRoundGenerator<ChampionshipState>;

    constructor(seed: string, initialState?: any, roundGenerator?: IRoundGenerator<ChampionshipState>) {
        this.initialState = initialState;
        this.seed = seed;
        this.roundGenerator = roundGenerator;
    }

    load(events: DomainEvent[]): ChampionshipEntity {
        return new ChampionshipEntity(this.getChampinshipState(events));
    }

    getChampinshipState(events: DomainEvent[]): ChampionshipState {
        return this.reduceCompose(events, (identity: any) => identity);
    }

    reduceCompose(events: DomainEvent[], reducerFactory: any) {
        return events.reduce(reducerFactory(this.reducer.bind(this)), this.getInitialState({ seed: this.seed, ...this.initialState }));
    }

    getInitialState(toMerge: any): ChampionshipState {
        return Object.assign({
            phase: ChampionshipPhase.PREPARATION,
            judges: [],
            participants: [],
            round: 0,
            rounds: [[]],
            votes: [[]],
            winners: [],
            seed: null,
            generator: this.roundGenerator.getType(),
            score: null,
            likes: []
        }, toMerge);
    }

    eventReducer(state: ChampionshipState, event: Event): ChampionshipState {
        switch(event.type) {
            case ChampionshipDomainEventType.ADD_PARTICIPANT:
                return Object.assign({}, state, { participants: [...(state.participants || []), event.payload] });
            case ChampionshipDomainEventType.REMOVE_PARTICIPANT:
                return Object.assign({}, state, { 
                    participants: (state.participants || []).filter((a) => a.participantID !== event.payload.participantID),
                    score: ChampionshipEntity.removeParticipantFromScore(state, event.payload),
                    likes: (state.likes || []).filter((a) => a.participant.participantID !== event.payload.participantID)
                });
            case ChampionshipDomainEventType.ADD_JUDGE:
                return Object.assign({}, state, { judges: [...(state.judges || []), event.payload] });
            case ChampionshipDomainEventType.REMOVE_JUDGE:
                return Object.assign({}, state, { judges: (state.judges || []).filter((a) => a.judgeID !== event.payload.judgeID) });
            case ChampionshipDomainEventType.START_CHAMPIONSHIP:
                return Object.assign({}, state, { 
                    phase: ChampionshipPhase.START_MATCHUP_VOTE, 
                    round: 0, 
                    rounds: this.roundGenerator.generateInitialRounds(Object.assign({}, state, { score: ChampionshipEntity.calculateInitialScore(state) })),
                    score: ChampionshipEntity.calculateInitialScore(state)
                });
            case ChampionshipDomainEventType.LIKE_PARTICIPANT:
                return Object.assign({}, state, {
                    likes: ChampionshipEntity.toggleLike(state, event.payload)
                });
            case ChampionshipDomainEventType.VOTE_IN_PARTICIPANT:
                return Object.assign({}, state, { 
                    votes: ChampionshipEntity.addVote(state, event.payload),
                    score: ChampionshipEntity.addScoreToParticipant(state, event.payload.participant)
                });
            case ChampionshipDomainEventType.UPDATE_JUDGE:
                return Object.assign({}, state, { judges: ChampionshipEntity.updateJudge(state, event.payload.judgeID, event.payload.data) });
            case ChampionshipDomainEventType.RESTART_CHAMPIONSHIP:
                return this.getInitialState({ judges: ChampionshipEntity.getUnreadyJudges(state) });
            default:
                return state;
        }
    }

    reducer(currentState: ChampionshipState, event: Event): ChampionshipState {
        let state = this.eventReducer(currentState, event);

        if (ChampionshipEntity.hasEveryoneVoted(state)) {
            if (this.roundGenerator.isFinalRound(state)) {
                return Object.assign({}, state, {
                    phase: ChampionshipPhase.FINISH_CHAMPIONSHIP,
                    winners: state.winners.concat([this.roundGenerator.getRoundWinner(state)]),
                });
            } else {
                const nextRoundIndex = state.round + 1;
                const winner = this.roundGenerator.getRoundWinner(state);

                const newVoteState = state.votes.concat([[]]);

                return Object.assign({}, state, {
                    phase: ChampionshipPhase.START_MATCHUP_VOTE,
                    rounds: this.roundGenerator.generateRound(state),
                    round: nextRoundIndex,
                    votes: newVoteState,
                    winners: state.winners.concat([winner]),
                    score: this.roundGenerator.getOptions()
                });
            }
        } else {
            return state;
        }
    }
}