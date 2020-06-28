import { Championship } from './championship';

describe("Championship tests", () => {
    it("should start championship", () => {
        const championship = new Championship();
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Mache', participantID: '2' });
        championship.addJudge({ token: '123' });
        expect(championship.getPhase()).toEqual('PREPARATION');
        championship.start();
        expect(championship.getPhase()).toEqual('START_MATCHUP_VOTE');
    });

    it("should generate round correctly", () => {
        const championship = new Championship();

        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });
        championship.addParticipant({ text: 'Ronaldo', participantID: '3' });
        championship.addParticipant({ text: 'Ozymandias', participantID: '4' });
        championship.addParticipant({ text: 'Alo', participantID: '5' });

        expect(championship.generateRounds().map((round) => round.map((p) => p.text))).toEqual([
            ['Ditongo', 'Pico'],
            ['Ronaldo', 'Ozymandias'],
            ['Alo']
        ]);
    });

    it("should vote for participant", () => {
        const championship = new Championship();

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { text: 'Pico', participantID: '2' }, judgeID: '123' });

        expect(championship.getCurrentVotes()).toEqual([
            { participant: { text: 'Pico', participantID: '2' }, judgeID: '123' }
        ]);
    });

    it("should transition to END phase when all judges have voted", () => {
        const championship = new Championship();

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { participantID: '2' }, judgeID: '123' });

        expect(championship.getPhase()).toEqual('START_MATCHUP_VOTE');

        championship.vote({ participant: { participantID: '2' }, judgeID: '1234' });

        expect(championship.getPhase()).toEqual('FINISH_CHAMPIONSHIP');
    });

    it("should advance winner to next machup", () => {
        const championship = new Championship();

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });;

        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });
        championship.addParticipant({ text: 'Pitanga', participantID: '3' });
        championship.addParticipant({ text: 'Jabuti', participantID: '4' });

        championship.start();

        championship.vote({ participant: { participantID: '2' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '2' }, judgeID: '1234' });

        let roundParticipantNames = championship.getRounds().map((round) => round.map((p) => p.text));

        expect(roundParticipantNames).toEqual([
            ['Ditongo', 'Pico'],
            ['Pitanga', 'Jabuti'],
            ['Pico']
        ]);

        championship.vote({ participant: { participantID: '3' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '3' }, judgeID: '1234' });

        roundParticipantNames = championship.getRounds().map((round) => round.map((p) => p.text));

        expect(roundParticipantNames).toEqual([
            ['Ditongo', 'Pico'],
            ['Pitanga', 'Jabuti'],
            ['Pico', 'Pitanga']
        ]);
    });

    it("should have a winner", () => {
        const championship = new Championship();

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });

        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { participantID: '2' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '2' }, judgeID: '1234' });

        expect(championship.getWinner().participant.text).toEqual('Pico');
    });

    it("should have a winner after multiple battles", () => {
        const championship = new Championship();

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });

        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });
        championship.addParticipant({ text: 'Pitanga', participantID: '3' });
        championship.addParticipant({ text: 'Jabuti', participantID: '4' });

        championship.start();

        championship.vote({ participant: { participantID: '2' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '2' }, judgeID: '1234' });
        championship.vote({ participant: { participantID: '3' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '3' }, judgeID: '1234' });
        championship.vote({ participant: { participantID: '3' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '3' }, judgeID: '1234' });

        expect(championship.getWinner().participant.text).toEqual('Pitanga');
    });

    it("should have the correct winner", () => {
        const championship = new Championship();
        championship.randomizeWinner = (draws) => draws[1];

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '12345', name: 'Mabi', icon: 'aloe' });

        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });
        championship.addParticipant({ text: 'Pitanga', participantID: '3' });

        championship.start();

        championship.vote({ participant: { participantID: '1' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '2' }, judgeID: '1234' });
        championship.vote({ participant: { participantID: '1' }, judgeID: '12345' });

        expect(championship.getWinner().participant.text).toEqual('Ditongo');
    });

    it("should randomize winner on draw", () => {
        const championship = new Championship();
        const spy = jest.spyOn(championship, 'randomizeWinner').mockImplementation((list) => list[0]);

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { participantID: '2' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '1' }, judgeID: '1234' });

        expect(spy).toHaveBeenCalled();
        expect(championship.getWinner().participant.text).toEqual('Ditongo');
    });

    it('should add DRAW badge to winner', () => {
        const championship = new Championship();

        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { participantID: '2' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '1' }, judgeID: '1234' });

        expect(championship.getWinners()[0].badges[0].type).toEqual('DRAW');
    });

    it('should add CLOSE_AS_FUCK badge to winner', () => {
        const championship = new Championship();
        
        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '12345', name: 'Ale', icon: 'aloe' });
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { participantID: '1' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '1' }, judgeID: '1234' });
        championship.vote({ participant: { participantID: '2' }, judgeID: '12345' });

        expect(championship.getWinners()[0].badges[0].type).toEqual('CLOSE_AS_FUCK');
    });

    it('should add ALL_IN_ONE badge to winner', () => {
        const championship = new Championship();
        
        championship.addJudge({ id: '123', name: 'Ale', icon: 'aloe' });
        championship.addJudge({ id: '1234', name: 'Ale', icon: 'aloe' });
        championship.addParticipant({ text: 'Ditongo', participantID: '1' });
        championship.addParticipant({ text: 'Pico', participantID: '2' });

        championship.start();

        championship.vote({ participant: { participantID: '1' }, judgeID: '123' });
        championship.vote({ participant: { participantID: '1' }, judgeID: '1234' });

        expect(championship.getWinners()[0].badges[0].type).toEqual('ALL_IN_ONE');
    });

});