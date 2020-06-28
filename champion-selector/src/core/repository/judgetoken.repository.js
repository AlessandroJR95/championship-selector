export class JudgeTokenRepository {
    constructor() {
        this.judgeToken = new Map();
    }

    assignJudgeIDToToken({ token, judgeID, championshipID }) {
        if (!this.judgeToken.has(championshipID)) {
            this.judgeToken.set(championshipID, new Map());
        }

        this.judgeToken.get(championshipID).set(token, judgeID);
    }

    getJudgeID({ championshipID, token }) {
        if (this.hasJudgeID({ championshipID, token })) {
            return {
                judgeID: this.judgeToken.get(championshipID).get(token)
            };
        }

        throw new Error('Dosent have judge for token');
    }

    getJudgeToken({ championshipID, judgeID }) {
        if (this.judgeToken.has(championshipID)) {
            return [...this.judgeToken.get(championshipID)].find(([ token, judgeIDLook ]) => judgeIDLook === judgeID)[0];
        }

        return null;
    }

    hasJudgeID({ championshipID, token }) {
        return this.judgeToken.has(championshipID) && this.judgeToken.get(championshipID).has(token);
    }

    removeToken({ championshipID, token }) {
        if (this.judgeToken.has(championshipID)) {
            this.judgeToken.get(championshipID).delete(token);
        }
    }

    remove({ championshipID }) {
        this.judgeToken.delete(championshipID);
    }
}