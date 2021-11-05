import { ChampionshipRepository } from './championship.repository';
import { EventStore } from '../../modules/store/event.store';
import { EventStoreFactory } from '../../modules/store/event.store.factory';
import { MockClientFactory } from '../../modules/store/clients/mock/mock.factory';
import { RoundGeneratorFactory } from '../../factories/round.generator.factory';
import { RoundGeneratorClassic } from '../round/round.generator.classic';
import { RoundGeneratorChallenger } from '../round/round.generator.challenger';
import { ChampionshipAggregateFactory } from '../../factories/championship.factory';
import { AggregateFactory } from '../../modules/aggregate/aggregate.factory';
import { Participant } from './championship.types';
import { ChampionshipEntity } from './championship.entity';

function getRoundParticipants(championship: ChampionshipEntity) {
    return championship.getState().rounds.map((r) => [r[0].participantID, r[1].participantID]);
}

describe("Championship tests", () => {
    let championshipRepository: ChampionshipRepository;

    beforeEach(() => {
        const eventFactory = new EventStoreFactory(new MockClientFactory());
        const eventStore = new EventStore(eventFactory);
        const roundGenerator = new RoundGeneratorFactory(new RoundGeneratorClassic());
        roundGenerator.add('clg', new RoundGeneratorChallenger());
        const aggregateFactory = new AggregateFactory(new ChampionshipAggregateFactory(roundGenerator));
        championshipRepository = new ChampionshipRepository(aggregateFactory, eventStore);
    });

    it("should get championship initial state", async () => {
        const championshipID = 'ale';
        const champ = await championshipRepository.get(championshipID);

        expect(champ.getState()).toEqual({
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
    });

    it("should execut championship flow", async () => {
        let championship;
        const championshipID = 'ale';

        championship = await championshipRepository.get(championshipID);
        expect(championship.hasEnoughJudges()).toEqual(false);

        const firstJudge = await championshipRepository.addJudge(championshipID, {
            name: '1',
            judgeID: '1',
            ready: false
        });

        championship = await championshipRepository.get(championshipID);
        expect(championship.hasEnoughJudges()).toEqual(true);

        const secondJudge = await championshipRepository.addJudge(championshipID, {
            name: '2',
            judgeID: '2',
            ready: false
        });

        const thirdJudge = await championshipRepository.addJudge(championshipID, {
            name: '3',
            judgeID: '3',
            ready: false
        });

        championship = await championshipRepository.get(championshipID);
        expect(championship.getJudges().length).toEqual(3);

        await championshipRepository.removeJudge(championshipID, '3');

        championship = await championshipRepository.get(championshipID);
        expect(championship.getJudges().length).toEqual(2);

        await championshipRepository.addParticipant(championshipID, { text: 'Part1', participantID: '1', judgeID: '2', data: {} } as Participant);

        championship = await championshipRepository.get(championshipID);
        expect(championship.hasEnoughParticipants()).toEqual(false);

        await championshipRepository.addParticipant(championshipID, { text: 'Part2', participantID: '2', judgeID: '2', data: {} } as Participant);

        championship = await championshipRepository.get(championshipID);
        expect(championship.hasEnoughParticipants()).toEqual(true);
        
        await championshipRepository.addParticipant(championshipID, { text: 'Part3', participantID: '3', judgeID: '2', data: {} } as Participant);
        await championshipRepository.addParticipant(championshipID, { text: 'Part4', participantID: '4', judgeID: '2', data: {} } as Participant);

        championship = await championshipRepository.get(championshipID);
        expect(championship.getParticipants().length).toEqual(4);

        await championshipRepository.removeParticipant(championshipID, '4');

        championship = await championshipRepository.get(championshipID);
        expect(championship.getParticipants().length).toEqual(3);
        expect(championship.isJudgeReady('2')).toEqual(false);

        await championshipRepository.setJudgeReady(championshipID, '2');

        championship = await championshipRepository.get(championshipID);
        expect(championship.isJudgeReady('2')).toEqual(true);

        await championshipRepository.startChampionship(championshipID);

        expect(championship.isInPreparationPhase()).toEqual(true);
        championship = await championshipRepository.get(championshipID);
        expect(championship.isInVotingPhase()).toEqual(true);

        expect(championship.getJudgesThatHaveVoted().length).toEqual(0);

        await championshipRepository.voteInParticipant(championshipID, '2', '2');

        championship = await championshipRepository.get(championshipID);
        expect(championship.getJudgesThatHaveVoted().length).toEqual(1);
        expect(championship.hasJudgeAreadyVoted('2')).toEqual(true);

        await championshipRepository.voteInParticipant(championshipID, '1', '3');

        championship = await championshipRepository.get(championshipID);
        expect(championship.getCurrentRoundIndex()).toEqual(1);

        await championshipRepository.voteInParticipant(championshipID, '1', '1');
        await championshipRepository.voteInParticipant(championshipID, '2', '1');

        championship = await championshipRepository.get(championshipID);
        expect(championship.isInFinishPhase()).toEqual(true);
        expect(championship.getWinner().participant.text).toEqual('Part1');
        expect(championship.getWinners().map((a) => a.participant.text)).toEqual(['Part2', 'Part1']);
    });

    it('should add score to participant when liked', async () => {
        const championshipID = 'championshipID';

        await championshipRepository.addJudge(championshipID, {
            name: '1',
            judgeID: '1',
            ready: false
        });

        await championshipRepository.addParticipant(championshipID, { text: 'Part1', participantID: '1', judgeID: '2', data: {} } as Participant);

        await championshipRepository.likeParticipant(championshipID, '1', '1');
        await championshipRepository.likeParticipant(championshipID, '2', '1');
        await championshipRepository.likeParticipant(championshipID, '3', '1');
        await championshipRepository.startChampionship(championshipID);

        const championship = await championshipRepository.get(championshipID);

        expect(championship.getScore()).toEqual([["1", 15]]);
    });

    it('should add score to participant when voted', async () => {
        const championshipID = 'championshipID';

        await championshipRepository.addJudge(championshipID, {
            name: '1',
            judgeID: '1',
            ready: false
        });

        await championshipRepository.addParticipant(championshipID, { text: 'Part1', participantID: '1', judgeID: '2', data: {} } as Participant);
        await championshipRepository.addParticipant(championshipID, { text: 'Part2', participantID: '2', judgeID: '2', data: {} } as Participant);

        await championshipRepository.likeParticipant(championshipID, '1', '1');

        await championshipRepository.startChampionship(championshipID);

        await championshipRepository.voteInParticipant(championshipID, '2', '2');

        const championship = await championshipRepository.get(championshipID);

        expect(championship.getScore()).toEqual([["1", 5], ["2", 1]]);
    });

    it('should generates round by challenger generator', async () => {
        const championshipID = 'championshipID::clg';

        const champ = await championshipRepository.get(championshipID);

        expect(champ.getState()).toEqual({
            generator: 'clg',
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

        await championshipRepository.addJudge(championshipID, {
            name: '1',
            judgeID: '1',
            ready: false
        });

        await championshipRepository.addJudge(championshipID, {
            name: '2',
            judgeID: '2',
            ready: false
        });

        await championshipRepository.addParticipant(championshipID, { text: 'Part1', participantID: '1', judgeID: '1', data: {} } as Participant);
        await championshipRepository.addParticipant(championshipID, { text: 'Part2', participantID: '2', judgeID: '1', data: {} } as Participant);
        await championshipRepository.addParticipant(championshipID, { text: 'Part3', participantID: '3', judgeID: '1', data: {} } as Participant);
        await championshipRepository.addParticipant(championshipID, { text: 'Part4', participantID: '4', judgeID: '1', data: {} } as Participant);

        await championshipRepository.likeParticipant(championshipID, 'judgeID', '1');
        await championshipRepository.likeParticipant(championshipID, 'judgeID2', '1');

        await championshipRepository.startChampionship(championshipID);

        let championship = await championshipRepository.get(championshipID);

        expect(getRoundParticipants(championship)).toEqual([["2", "3"]]);

        await championshipRepository.voteInParticipant(championshipID, '2', '2');
        await championshipRepository.voteInParticipant(championshipID, '1', '2');

        championship = await championshipRepository.get(championshipID);

        expect(getRoundParticipants(championship)).toEqual([["2", "3"], ["4", "2"]]);

        await championshipRepository.voteInParticipant(championshipID, '2', '4');
        await championshipRepository.voteInParticipant(championshipID, '1', '4');

        championship = await championshipRepository.get(championshipID);

        expect(getRoundParticipants(championship)).toEqual([["2", "3"], ["4", "2"], ["4", "1"]]);
    });

});