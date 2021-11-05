import { IEventSourcedRepository } from "../../modules/interfaces";
import { ChampionshipEntity } from "./championship.entity";
import { EventStore } from "../../modules/store/event.store";
import { DomainEvent } from "../../modules/event/domain.event";
import { AddParticipantEvent, RemoveParticipantEvent, AddJudgeEvent, RemoveJudgeEvent, UpdateJudgeEvent, StartChampionshipEvent, VoteInParticipantEvent, RestartChampionshipEvent, LikeParticipantEvent } from "./championship.domain.events";
import { Participant, Judge } from "./championship.types";
import { AggregateFactory } from "../../modules/aggregate/aggregate.factory";

export class ChampionshipRepository implements IEventSourcedRepository<ChampionshipEntity> {
    private eventStore: EventStore;
    private aggregateFactory: AggregateFactory;
    
    constructor(aggregateFactory: AggregateFactory, eventStore: EventStore) {
        this.eventStore = eventStore;
        this.aggregateFactory = aggregateFactory;
    }

    getKEY(identifier: string): string {
        return `championship/${identifier}`;
    }

    addParticipant(entityID: string, participant: Participant): Promise<any> {
        return this.save(entityID, new AddParticipantEvent(participant));
    }

    likeParticipant(entityID: string, judgeID: string, participantID: string): Promise<any> {
        return this.save(entityID, new LikeParticipantEvent(judgeID, participantID));
    }

    removeParticipant(entityID: string, participantID: string): Promise<any> {
        return this.save(entityID, new RemoveParticipantEvent(participantID));
    }

    addJudge(entityID: string, judge: Judge): Promise<any> {
        return this.save(entityID, new AddJudgeEvent(judge));
    }

    removeJudge(entityID: string, judgeID: string): Promise<any> {
        return this.save(entityID, new RemoveJudgeEvent(judgeID));
    }

    setJudgeReady(entityID: string, judgeID: string): Promise<any> {
        return this.save(entityID, new UpdateJudgeEvent(judgeID, { ready: true }));
    }

    startChampionship(entityID: string): Promise<any> {
        return this.save(entityID, new StartChampionshipEvent());
    }

    voteInParticipant(entityID: string, judgeID: string, participantID: string): Promise<any> {
        return this.save(entityID, new VoteInParticipantEvent(judgeID, participantID));
    }

    restartChampionship(entityID: string): Promise<any> {
        return this.save(entityID, new RestartChampionshipEvent());
    }

    delete(entityID: string) {
        return this.eventStore.delete(this.getKEY(entityID));
    }

    save(entityID: string, event: DomainEvent) {
        return this.eventStore.pushTo(this.getKEY(entityID), event);
    }

    get(entityID: string): Promise<ChampionshipEntity> {
        return this.eventStore.getEvents(this.getKEY(entityID))
            .then((events) => Promise.resolve(this.aggregateFactory.create(entityID).load(events)));
    }
}