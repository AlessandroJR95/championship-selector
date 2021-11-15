import { Command } from "src/modules/command/command";
import { ChampionshipDomainEventType, Participant, Judge } from "src/core/championship/domain/championship.types";

export class AddParticipantCommand extends Command {
    constructor(entityID: string, participant: Participant) {
        super(entityID, ChampionshipDomainEventType.ADD_PARTICIPANT, participant);
    }
}

export class RemoveParticipantCommand extends Command {
    constructor(entityID: string, participantID: string) {
        super(entityID, ChampionshipDomainEventType.REMOVE_PARTICIPANT, { participantID });
    }
}

export class AddJudgeCommand extends Command {
    constructor(entityID: string, judge: Judge, token: string) {
        super(entityID, ChampionshipDomainEventType.ADD_JUDGE, { judge, token });
    }
}

export class RemoveJudgeCommand extends Command {
    constructor(entityID: string, judgeID: string) {
        super(entityID, ChampionshipDomainEventType.REMOVE_JUDGE, { judgeID });
    }
}

export class SetJudgeReadyCommand extends Command {
    constructor(entityID: string, judgeID: string) {
        super(entityID, ChampionshipDomainEventType.UPDATE_JUDGE, { judgeID });
    }
}

export class StartChampionshipCommand extends Command {
    constructor(entityID: string, payload?: any) {
        super(entityID, ChampionshipDomainEventType.START_CHAMPIONSHIP, payload);
    }
}

export class VoteInParticipantCommand extends Command {
    constructor(entityID: string, judgeID: string, participantID: string) {
        super(entityID, ChampionshipDomainEventType.VOTE_IN_PARTICIPANT, { judge: { judgeID }, participant: { participantID } });
    }
}

export class LikeParticipantCommand extends Command {
    constructor(entityID: string, judgeID: string, participantID: string) {
        super(entityID, ChampionshipDomainEventType.LIKE_PARTICIPANT, { judge: { judgeID }, participant: { participantID } });
    }
}

export class RestartChampionshipCommand extends Command {
    constructor(entityID: string, payload?: any) {
        super(entityID, ChampionshipDomainEventType.RESTART_CHAMPIONSHIP, payload);
    }
}

export class ValidateChampionshipCommand extends Command {
    constructor(entityID: string, payload?: any) {
        super(entityID, 'VALIDATE_CHAMPIONSIHP_COMMAND', payload);
    }
}