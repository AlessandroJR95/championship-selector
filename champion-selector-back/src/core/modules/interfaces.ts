import { DomainEvent } from "./event/domain.event";
import { Event } from "./event/event";
import { Command } from "./command/command";
import { EventBus } from "./event/event.bus";
import { Request } from "express";

export interface IAggregate<T> {
    load: (events: DomainEvent[]) => T;
}

export interface IEventSourcedRepository<T> {
    save: (entityID: string, event: DomainEvent) => void;
    get: (entityID: string) => Promise<T>;
    delete: (entityID: string) => void;
}

export interface IEventHandler {
    handle: (event: Event) => void;
}

export interface IEventStore {
    push: (entityID: string, event: DomainEvent) => void;
    getEvents: (entityID: string) => DomainEvent[];
}

export interface IEventStoreFactory {
    create: () => IStoreClient;
}

export interface IStoreClient {
    append: (key: string, data: string, cb: (err: Error) => void) => void;
    get: (key: string, cb: (err: Error, data: string) => void) => void;
    del: (key: string, cb: (err: Error) => void) => void;
}

export interface IEventBus {
    dispatch: (event: Event) => void;
    addHandler: (type: any, handler: IEventHandler) => IEventBus;
}

export interface IMessageClient {
    subscribeToQueue: (name: string, callback: (msg: unknown) => void) => void;
    subscribeToRPC: (name: string, callback: (msg: unknown) => void) => void;
    subscribeToTopic: (name: string, callback: (msg: unknown) => void) => void;
    dispatch: (name: string, data: unknown) => void;
    publish: (name: string, data: unknown) => void;
    publishToRPC: (name: string, data: unknown) => void;
}

export interface IMessageFactory {
    create: () => IMessageClient;
}

export interface ICommandHandler {
    handle: (command: Command, eventBus: EventBus) => any;
}

export interface ICommandBus {
    dispatch: (command: Command) => void;
    addHandler: (type: any, handler: ICommandHandler) => ICommandBus;
}

export interface RequestWithSession extends Request {
    session: any;
}

export interface IAggregateFactory<T> {
    create: (entityID: string) => IAggregate<T>;
}