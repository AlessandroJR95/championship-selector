import { EventStore } from "src/modules/store/event.store";
import { IEventSourcedRepository } from "src/modules/interfaces";
import { MovieEntity } from "src/features/movie/domain/movie.entity";
import { DomainEvent } from "src/modules/event/domain.event";
import { MovieAggregate } from "src/features/movie/domain/movie.aggregate";
import { TransitionToMovieContext, SetGenreWinner } from "src/features/movie/domain/movie.domain.events";
import { Winner } from "src/core/championship/domain/championship.entity.winner";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";

export class MovieRepository implements IEventSourcedRepository<MovieEntity> {
    private eventStore: EventStore;
    private roundGenerator: RoundGeneratorFactory;
    
    constructor(eventStore: EventStore, roundGenerator: RoundGeneratorFactory) {
        this.eventStore = eventStore;
        this.roundGenerator = roundGenerator;
    }

    getKEY(identifier: string): string {
        return `championship/${identifier}`;
    }

    transitionToMovieContext(entityID: string): Promise<any> {
        return this.save(entityID, new TransitionToMovieContext());
    }

    setGenreWinner(entityID: string, winner: Winner) {
        return this.save(entityID, new SetGenreWinner(winner));
    }

    delete(entityID: string) {
        return this.eventStore.delete(entityID);
    }

    save(entityID: string, event: DomainEvent) {
        return this.eventStore.pushTo(this.getKEY(entityID), event);
    }

    get(entityID: string): Promise<MovieEntity> {
        return this.eventStore.getEvents(this.getKEY(entityID))
            .then((events) => Promise.resolve(new MovieAggregate(entityID, null, this.roundGenerator.create(entityID)).load(events)));
    }
}