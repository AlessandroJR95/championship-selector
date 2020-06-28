export class MetricsController {
    constructor(championshipRepository, roomRepository, permissionRepository, roomChampionshipRepository, subscriptionRepository, judgeTokenRepo) {
        this.championshipRepository = championshipRepository;
        this.roomRepository = roomRepository;
        this.permissionRepository = permissionRepository;
        this.roomChampionshipRepository = roomChampionshipRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.judgeTokenRepo = judgeTokenRepo;
    }

    getKeys(map) {
        return [...map.keys()];
    }

    getMetrics(req, res) {
        res.status(200).json({
            championship: this.getKeys(this.championshipRepository.championships),
            rooms: this.getKeys(this.roomRepository.rooms),
            permissions: this.getKeys(this.permissionRepository.permissions),
            roomChampionship: this.getKeys(this.roomChampionshipRepository.roomChampionship),
        });
    }
}