import { ChampionshipService } from "src/core/championship/integration/championship.service";
import { ChampionshipRepository } from "src/core/championship/domain/championship.repository";
import { EventStoreFactory } from "src/modules/store/event.store.factory";
import { MockClientFactory } from "src/modules/store/clients/mock/mock.factory";
import { MockMessageFactory } from "src/modules/store/clients/mock/mock.factory";
import { EventStore } from "src/modules/store/event.store";
import { PermissionRepository } from "src/core/permission/domain/permission.repository";
import { MessageFactory } from "src/modules/message/message.factory";
import { MessageQueue } from "src/modules/message/message.queue";
import { EventBus } from "src/modules/event/event.bus";
import { CommandBus } from "src/modules/command/command.bus";
import { AddParticipantCommand, RemoveParticipantCommand, AddJudgeCommand, RemoveJudgeCommand, SetJudgeReadyCommand, StartChampionshipCommand, VoteInParticipantCommand, RestartChampionshipCommand, LikeParticipantCommand } from "src/core/championship/integration/championship.commands";
import { AddParticipantHandler, RemoveParticipantHandler, AddJudgeHandler, RemoveJudgeHandler, SetJudgeReadyHandler, StartChampionshipHandler, VoteInParticipantHandler, RestartChampionshipHandler, LikeParticipantHandler } from "undefined";
import { AggregateFactory } from "src/modules/aggregate/aggregate.factory";
import { ChampionshipAggregateFactory } from "src/core/championship/domain/championship.factory";
import { RoundGeneratorFactory } from "src/core/championship/domain/round.generator.factory";
import { RoundGeneratorClassic } from "src/core/championship/domain/round.generator.classic";
import { RoundGeneratorChallenger } from "src/core/championship/domain/round.generator.challenger";

describe("ChampionshipService tests", () => {
    let championshipService: ChampionshipService;
    let championshipRepository: ChampionshipRepository;
    let permissionRepository: PermissionRepository;

    beforeEach(() => {
        const eventFactory = new EventStoreFactory(new MockClientFactory());
        const messageFactory = new MessageFactory(new MockMessageFactory());

        const eventStore = new EventStore(eventFactory);
        const messageQueue = new MessageQueue(messageFactory);

        const eventBus = new EventBus(messageQueue);
        const commandBus = new CommandBus(messageQueue, eventBus);
        const roundGenerator = new RoundGeneratorFactory(new RoundGeneratorClassic());
        roundGenerator.add('clg', new RoundGeneratorChallenger());
        const aggregateFactory = new AggregateFactory(new ChampionshipAggregateFactory(roundGenerator));

        championshipRepository = new ChampionshipRepository(aggregateFactory, eventStore);
        permissionRepository = new PermissionRepository(eventStore);

        commandBus
            .addHandler(AddParticipantCommand, new AddParticipantHandler(championshipRepository))
            .addHandler(RemoveParticipantCommand, new RemoveParticipantHandler(championshipRepository))
            .addHandler(AddJudgeCommand, new AddJudgeHandler(championshipRepository, permissionRepository))
            .addHandler(RemoveJudgeCommand, new RemoveJudgeHandler(championshipRepository))
            .addHandler(SetJudgeReadyCommand, new SetJudgeReadyHandler(championshipRepository))
            .addHandler(StartChampionshipCommand, new StartChampionshipHandler(championshipRepository))
            .addHandler(VoteInParticipantCommand, new VoteInParticipantHandler(championshipRepository))
            .addHandler(RestartChampionshipCommand, new RestartChampionshipHandler(championshipRepository))
            .addHandler(LikeParticipantCommand, new LikeParticipantHandler(championshipRepository));

        championshipService = new ChampionshipService(
            championshipRepository,
            permissionRepository,
            commandBus
        );
    });

    it("should create championship", async () => {
        const championship = await championshipService.createChampionship('::cls');

        const championshipEntity = await championshipRepository.get(championship.championshipID);
        const permission = await permissionRepository.get(championship.championshipID)

        expect(championshipEntity.getState()).toEqual({
            generator: 'classic',
            phase: 'PREPARATION',
            judges: [],
            participants: [],
            round: 0,
            rounds: [[]],
            votes: [[]],
            winners: [],
            score: null,
            likes: []
        });

        expect(permission.hasOwnerPermission(championship.token)).toEqual(true);
    });

    it("should enter in championship as judge", async () => {
        const championship = await championshipService.createChampionship('::cls');
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const championshipEntity = await championshipRepository.get(championship.championshipID);
        expect(championshipEntity.getJudges().length).toEqual(1);
    });

    it("should not enter in championship as judge", async () => {
        const championship = await championshipService.createChampionship('::cls');

        try {
            await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: '', icon: 'teste' }, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual('Cant connect to the room without a name');
        }
        
    });

    it("should add participant", async () => {
        const championship = await championshipService.createChampionship('::cls');
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: 'ola' }, token: championship.token });

        const championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getParticipants()[0].data).toEqual({ text: "ola" });

        try {
            await championshipService.addParticipantInChampionship({ championshipID: '1', participant: { text: 'ola' }, token: '1' });
        } catch (e) {
            expect(e.message).toEqual('Dosent have judge for token');
        }

        try {
            await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: 'ola' }, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual('Could not add a participant: already has it');
        }

        try {
            await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '' }, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual('Could not add a participant: empty name');
        }
    });

    it("should remove participant", async () => {
        const championship = await championshipService.createChampionship('::cls');
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const participant = await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: 'ola' }, token: championship.token });
        
        try {
            await championshipService.removeParticipantFromChampionship({ championshipID: championship.championshipID, participantID: participant.participantID, token: '' });
        } catch (e) {
            expect(e.message).toEqual('Only the owner can remove participants');
        }

        await championshipService.removeParticipantFromChampionship({ championshipID: championship.championshipID, participantID: participant.participantID, token: championship.token });

        const championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getParticipants()).toEqual([]);
    });

    it("should start championship", async () => {
        const championship = await championshipService.createChampionship('::cls');

        try {
            await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual("Cant start championship: dosent have enough judges");
        }

        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }});

        try {
            await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual("Cant start championship: dosent have enough participants");
        }

        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '1' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '2' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '3' }, token: championship.token });

        let championshipEntity = await championshipRepository.get(championship.championshipID);
        expect(championshipEntity.isInPreparationPhase()).toEqual(true);

        try {
            await championshipService.startChampionship({ championshipID: championship.championshipID, token: '' });
        } catch (e) {
            expect(e.message).toEqual("Cant start championship: you isnt the owner");
        }

        try {
            await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual("Cant start championship: all judges should be ready");
        }

        await championshipService.setJudgeReady({ championshipID: championship.championshipID, token: user.token });
        await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);
        expect(championshipEntity.isInPreparationPhase()).toEqual(false);
        expect(championshipEntity.isInVotingPhase()).toEqual(true);

        try {
            await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual("Cant start championship: isnt in praparation phase");
        }

    });

    it("should execute championship flow and restart", async () => {
        const championship = await championshipService.createChampionship('::cls');
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }});
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '1' }, token: championship.token });
        const participant = await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '2' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '3' }, token: championship.token });        
        await championshipService.setJudgeReady({ championshipID: championship.championshipID, token: user.token });
        await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });

        let championshipEntity = await championshipRepository.get(championship.championshipID);
        expect(championshipEntity.getCurrentRoundIndex()).toEqual(0);

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participant.participantID, token: championship.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participant.participantID, token: user.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);
        expect(championshipEntity.getCurrentRoundIndex()).toEqual(1);

        try {
            await championshipService.restartChampionship({ championshipID: championship.championshipID, participantID: participant.participantID, token: championship.token });
        } catch (e) {
            expect(e.message).toEqual('Cant restart championship: isnt finished');
        }

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participant.participantID, token: championship.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participant.participantID, token: user.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);
        expect(championshipEntity.getWinner().participant.data).toEqual({ text: "2" });
        expect(championshipEntity.getWinners().map((a) => a.participant.data.text)).toEqual(["2", "2"]);

        try {
            await championshipService.restartChampionship({ championshipID: championship.championshipID, participantID: participant.participantID, token: user.token });
        } catch (e) {
            expect(e.message).toEqual('Cant restart championship: you isnt the owner');
        }

        await championshipService.restartChampionship({ championshipID: championship.championshipID, participantID: participant.participantID, token: championship.token });

        championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.isInPreparationPhase()).toEqual(true);
    });

    it("should get championship info", async () => {
        const championship = await championshipService.createChampionship('::cls');

        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        const user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }});

        const participant = await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '1' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '2' }, token: championship.token });

        let info = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: championship.token });
        let userInfo = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: user.token });

        expect(info.allReady).toEqual(false);
        expect(info.isOwner).toEqual(true);
        expect(info.hasVoted).toEqual(false);
        expect(userInfo.allReady).toEqual(false);
        expect(userInfo.isOwner).toEqual(false);
        expect(userInfo.hasVoted).toEqual(false);

        await championshipService.setJudgeReady({ championshipID: championship.championshipID, token: user.token });

        info = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: championship.token });
        userInfo = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: user.token });

        expect(info.allReady).toEqual(true);
        expect(info.isOwner).toEqual(true);
        expect(info.hasVoted).toEqual(false);
        expect(userInfo.allReady).toEqual(true);
        expect(userInfo.isReady).toEqual(true);
        expect(userInfo.hasVoted).toEqual(false);

        await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });
        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participant.participantID, token: championship.token });

        info = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: championship.token });
        userInfo = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: user.token });
        
        expect(info.hasVoted).toEqual(true);
        expect(info.whoVoted.length).toEqual(1);
        expect(userInfo.hasVoted).toEqual(false);

        await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participant.participantID, token: user.token });

        info = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: championship.token });
        userInfo = await championshipService.getChampionshipInfo({ championshipID: championship.championshipID, token: user.token });

        expect(info.hasVoted).toEqual(true);
        expect(info.whoVoted.length).toEqual(2);
        expect(userInfo.hasVoted).toEqual(true);
    });

    it("invited user can enter in the middle of championship", async () => {
        const championship = await championshipService.createChampionship('::cls');
        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '2' }, token: championship.token });
        await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '3' }, token: championship.token });
        await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });

        try {
            await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Judge', icon: 'teste' }});
        } catch (e) {
            expect(e.message).toEqual('Cant connect in a room that isnt in preparation');
        }

        try {
            await championshipService.generateAnInviteLink({ championshipID: championship.championshipID, token: 'faketoken' });
        } catch (e) {
            expect(e.message).toEqual('Cant generate invite for championship: you isnt the owner');
        }

        const invite = await championshipService.generateAnInviteLink({ championshipID: championship.championshipID, token: championship.token });

        await championshipService.validateInviteToken({ championshipID: championship.championshipID, token: invite.token });

        await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Judge', icon: 'teste' }, token: invite.token});

        const championshipEntity = await championshipRepository.get(championship.championshipID);

        expect(championshipEntity.getJudges().map((j) => j.name)).toEqual(['Ale', 'Judge']);

        try {
            await championshipService.validateInviteToken({ championshipID: championship.championshipID, token: invite.token });
        } catch (e) {
            expect(e.message).toEqual('Invalid invite');
        }
    });

    describe('voting', () => {
        let championship, user, participants;

        async function getChampionshipEntiy() {
            return championshipRepository.get(championship.championshipID);
        }

        beforeEach(async () => {
            championship = await championshipService.createChampionship();
            await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }, token: championship.token });
            user = await championshipService.enterInChampionshipAsJudge({ championshipID: championship.championshipID, judge: { name: 'Ale', icon: 'teste' }});
            participants = [
                await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '1' }, token: championship.token }),
                await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '2' }, token: championship.token }),
                await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '3' }, token: championship.token }),
                await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '4' }, token: championship.token }),
                await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '5' }, token: championship.token }),
                await championshipService.addParticipantInChampionship({ championshipID: championship.championshipID, participant: { text: '6' }, token: championship.token }),
            ];
            await championshipService.setJudgeReady({ championshipID: championship.championshipID, token: user.token });
        });

        it('should not vote for a partitipant that isnt in current round', async() => {
            await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });

            try {
                await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participants[3].participantID, token: championship.token });
            } catch (e) {
                expect(e.message).toEqual('Could not vote for participant: isnt in the current round');
            }

            try {
                await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participants[3].participantID, token: user.token });
            } catch (e) {
                expect(e.message).toEqual('Could not vote for participant: isnt in the current round');
            }

            const championshipEntity = await getChampionshipEntiy();

            expect(championshipEntity.getCurrentRoundIndex()).toEqual(0);
        });

        it('should not get top scored for next round', async() => {
            await championshipService.likeParticipant({ championshipID: championship.championshipID, participantID: participants[0].participantID, token: championship.token });
            await championshipService.likeParticipant({ championshipID: championship.championshipID, participantID: participants[0].participantID, token: user.token });

            await championshipService.startChampionship({ championshipID: championship.championshipID, token: championship.token });

            let championshipEntity = await getChampionshipEntiy();

            expect(championshipEntity.getCurrentRound().map((a) => a.data.text)).toEqual(['2', '3']);

            await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participants[2].participantID, token: championship.token });
            await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participants[2].participantID, token: user.token });

            championshipEntity = await getChampionshipEntiy();

            expect(championshipEntity.getCurrentRound().map((a) => a.data.text)).toEqual(['4', '5']);

            await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participants[3].participantID, token: championship.token });
            await championshipService.voteInParticipant({ championshipID: championship.championshipID, participantID: participants[3].participantID, token: user.token });

            championshipEntity = await getChampionshipEntiy();

            expect(championshipEntity.getCurrentRound().map((a) => a.data.text)).toEqual(['6', '4']);
        });

    });

});