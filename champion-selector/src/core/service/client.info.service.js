export class ClientInfoService {
    constructor(championshipRepository, permissionRepository, roomChampionshipRepository, judgeTokenRepository) {
        this.championshipRepository = championshipRepository;
        this.permissionRepository = permissionRepository;
        this.roomChampionshipRepository = roomChampionshipRepository;
        this.judgeTokenRepository = judgeTokenRepository;
    }

    getInfo({ roomID, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const { judgeID } = this.judgeTokenRepository.getJudgeID({ token, championshipID });

        return {
            judgeID,
            whoVoted: this.championshipRepository.getJudgesThatHaveVoted({ championshipID }),
            hasVoted: this.championshipRepository.hasJudgeAreadyVoted({ championshipID, judgeID }),
            allReady: this.championshipRepository.allJudgesReady({ championshipID }),
            isOwner: this.permissionRepository.hasOwnerPermission({ championshipID, token }),
            isReady: this.championshipRepository.isJudgeReady({ championshipID, judgeID })
        };
    }

}