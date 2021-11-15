import { Participant, Badge, Vote, Judge } from "src/core/championship/domain/championship.types";

export class Winner {
    participant: Participant;
    badges: Badge[];

    constructor(participant: Participant) {
        this.participant = participant;
        this.badges = [];
    }

    wasClose({ votes, winnerVotes }: any) {
        const nonWinnerVotesCount = votes.length - winnerVotes.length;
        return winnerVotes.length - nonWinnerVotesCount === 1;
    }

    wasDraw({ votes, winnerVotes }: any) {
        const nonWinnerVotesCount = votes.length - winnerVotes.length;
        return winnerVotes.length - nonWinnerVotesCount === 0;
    }

    wasAllInOne({ votes }: any) {
        return votes.every((vote: Vote) => vote.participant.participantID === this.participant.participantID);
    }

    calculateBadges({ votes, winnerVotes, judges }: any) {
        if (this.wasAllInOne({ votes })) {
            this.badges.push(new Badge('ALL_IN_ONE', null));
        }

        if (this.wasClose({ votes, winnerVotes })) {
            const deciderJudge = judges.find((judge: Judge) => judge.judgeID === winnerVotes[winnerVotes.length  - 1].judge.judgeID);
            this.badges.push(new Badge('CLOSE_AS_FUCK', { decider: deciderJudge.name }));
        }

        if (this.wasDraw({ votes, winnerVotes })) {
            this.badges.push(new Badge('DRAW', null));
        }

        return this;
    }
}