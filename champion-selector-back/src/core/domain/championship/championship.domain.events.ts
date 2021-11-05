import { DomainEvent } from '../../modules/event/domain.event';
import { ChampionshipDomainEventType, Participant, Judge } from './championship.types';

export class AddParticipantEvent extends DomainEvent {
    constructor(participant: Participant) {
        super(ChampionshipDomainEventType.ADD_PARTICIPANT, participant);
    }
}

export class RemoveParticipantEvent extends DomainEvent {
    constructor( participantID: string) {
        super(ChampionshipDomainEventType.REMOVE_PARTICIPANT, { participantID });
    }
}

export class AddJudgeEvent extends DomainEvent {
    constructor(judge: Judge) {
        super(ChampionshipDomainEventType.ADD_JUDGE, judge);
    }
}

export class RemoveJudgeEvent extends DomainEvent {
    constructor(judgeID: string) {
        super(ChampionshipDomainEventType.REMOVE_JUDGE, { judgeID });
    }
}

export class UpdateJudgeEvent extends DomainEvent {
    constructor(judgeID: string, data: any) {
        super(ChampionshipDomainEventType.UPDATE_JUDGE, { judgeID, data });
    }
}

export class StartChampionshipEvent extends DomainEvent {
    constructor(payload?: any) {
        super(ChampionshipDomainEventType.START_CHAMPIONSHIP, payload);
    }
}

export class VoteInParticipantEvent extends DomainEvent {
    constructor(judgeID: string, participantID: string) {
        super(ChampionshipDomainEventType.VOTE_IN_PARTICIPANT, { judge: { judgeID }, participant: { participantID } });
    }
}

export class LikeParticipantEvent extends DomainEvent {
    constructor(judgeID: string, participantID: string) {
        super(ChampionshipDomainEventType.LIKE_PARTICIPANT, { judge: { judgeID }, participant: { participantID } });
    }
}

export class RestartChampionshipEvent extends DomainEvent {
    constructor() {
        super(ChampionshipDomainEventType.RESTART_CHAMPIONSHIP);
    }
}