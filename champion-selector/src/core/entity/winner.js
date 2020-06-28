export class Winner {
    constructor(participant) {
        this.participant = participant;
        this.badges = [];
    }

    wasClose({ votes, winnerVotes }) {
        const nonWinnerVotesCount = votes.length - winnerVotes.length;
        return winnerVotes.length - nonWinnerVotesCount === 1;
    }

    wasDraw({ votes, winnerVotes }) {
        const nonWinnerVotesCount = votes.length - winnerVotes.length;
        return winnerVotes.length - nonWinnerVotesCount === 0;
    }

    wasAllInOne({ votes }) {
        return votes.every((vote) => vote.participant.participantID === this.participant.participantID);
    }

    calculateBadges({ votes, winnerVotes, judges }) {
        if (this.wasAllInOne({ votes })) {
            this.badges.push({ type: 'ALL_IN_ONE', value: null });
        }

        if (this.wasClose({ votes, winnerVotes })) {
            const deciderJudge = judges.find((judge) => judge.id === winnerVotes[winnerVotes.length  - 1].judgeID);
            this.badges.push({ type: 'CLOSE_AS_FUCK', value: { decider: deciderJudge.name }});
        }

        if (this.wasDraw({ votes, winnerVotes })) {
            this.badges.push({ type: 'DRAW', value: null });
        }

        return this;
    }
}