import { Winner } from "src/core/championship/domain/championship.entity.winner";

export enum ChampionshipPhase {
    PREPARATION = 'PREPARATION',
    START_MATCHUP_VOTE = 'START_MATCHUP_VOTE',
    FINISH_CHAMPIONSHIP = 'FINISH_CHAMPIONSHIP',
}

export class Judge {
    ready: boolean;
    judgeID: string;
    name: string;
    icon?: string;

    constructor(name: string, icon: string, judgeID: string) {
        this.name = name;
        this.icon = icon;
        this.judgeID = judgeID;
        this.ready = false;
    }
}

export class Participant {
    participantID: string;
    judgeID: string;
    data: any;

    constructor(participantID: string, judgeID: string, data: any) {
        this.participantID = participantID;
        this.judgeID = judgeID;
        this.data = data;
    }
}

export type Round<T> = T[];

export class Vote {
    judge: Judge;
    participant: Participant;
}

export class Badge {
    type: string;
    value: any;

    constructor(type: string, value: any) {
        this.type = type;
        this.value = value;
    }
}

export class Like {
    judge: Judge;
    participant: Participant;
}

export class ChampionshipState {
    phase: ChampionshipPhase;
    judges: Judge[];
    participants: Participant[];
    round: number;
    rounds: Round<Participant>[];
    votes: Vote[][];
    winners: Winner[];
    seed: string;
    generator: string;
    score: Map<string, number>;
    likes: Like[];

    constructor() {
        this.phase = ChampionshipPhase.PREPARATION;
        this.judges = [];
        this.participants = [];
        this.round = 0;
        this.rounds = [[]];
        this.votes = [[]];
        this.winners = [];
        this.seed = null;
    }
}

export interface IRoundGenerator<T> {
    generateInitialRounds: (state: T) => Round<Participant>[];
    generateRound: (state: T) => Round<Participant>[];
    getRoundWinner: (state: T) => Winner;
    isFinalRound: (state: T) => Boolean;
    create: () => IRoundGenerator<T>;
    getType: () => string;
    getOptions?: () => any[][];
}

export enum ChampionshipDomainEventType {
    ADD_PARTICIPANT = 'ADD_PARTICIPANT',
    REMOVE_PARTICIPANT = 'REMOVE_PARTICIPANT',
    ADD_JUDGE = 'ADD_JUDGE',
    REMOVE_JUDGE = 'REMOVE_JUDGE',
    UPDATE_JUDGE = 'UPDATE_JUDGE',
    START_CHAMPIONSHIP = 'START_CHAMPIONSHIP',
    VOTE_IN_PARTICIPANT = 'VOTE_IN_PARTICIPANT',
    KILL_CHAMPIONSHIP = 'KILL_CHAMPIONSHIP',
    RESTART_CHAMPIONSHIP = 'RESTART_CHAMPIONSHIP',
    LIKE_PARTICIPANT = 'LIKE_PARTICIPANT',
}