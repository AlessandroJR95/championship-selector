import { ChampionshipRepository } from "../../core/domain/championship/championship.repository";
import { PermissionRepository } from "../../core/domain/permission/permission.repository";
import { CommandBus } from "../../core/modules/command/command.bus";
import { generateID } from "../../core/modules/utils/hash";
import { AddJudgeCommand, AddParticipantCommand, RemoveParticipantCommand, SetJudgeReadyCommand, VoteInParticipantCommand, StartChampionshipCommand, RestartChampionshipCommand, LikeParticipantCommand } from "../../core/commands/championship/championship.commands";
import { Judge, Participant } from "../../core/domain/championship/championship.types";
import { ChampionshipEntity } from "../../core/domain/championship/championship.entity";

export class ChampionshipService {
    private championshipRepository: ChampionshipRepository;
    private permissionRepository: PermissionRepository;
    private commandBus: CommandBus;

    constructor(championshipRepository: ChampionshipRepository, permissionRepository: PermissionRepository, commandBus: CommandBus) {
        this.championshipRepository = championshipRepository;
        this.permissionRepository = permissionRepository;
        this.commandBus = commandBus;
    }

    async createChampionship(type?: string) {
        const championshipID = `${generateID({ short: true })}${type ? ':' + type : '::clg'}`;
        const token = generateID();

        await this.permissionRepository.createOwnerToken(championshipID, token);

        return {
            championshipID,
            token
        };
    }

    async enterInChampionshipAsJudge({ championshipID, judge, token }: any) {
        const [ championship, permission ] = await Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        let permissionToken = null;

        if (!championship.isInPreparationPhase() && !permission.hasUserPermission(token)) {
            throw new Error('Cant connect in a room that isnt in preparation');
        }

        if (!judge || !judge.name) {
            throw new Error('Cant connect to the room without a name');
        }

        if (permission.hasOwnerPermission(token) || permission.hasUserPermission(token)) {
            permissionToken = token;
        } else {
            const newToken = generateID();
            await this.permissionRepository.createUserToken(championshipID, newToken);
            permissionToken = newToken;
        }

        const judgeID = generateID();

        await this.commandBus.dispatchRPC(
            new AddJudgeCommand(
                championshipID,
                new Judge(judge.name, judge.icon, judgeID),
                permissionToken
            )
        );

        return {
            token: permissionToken,
            judgeID
        };
    }

    async addParticipantInChampionship({ championshipID, participant, token }: any) {
        const [ championship, permission ] = await Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        const judgeID = permission.getJudgeID(token);
        const participantID = generateID();

        if (!judgeID) {
            throw new Error('Dosent have judge for token');
        }

        if (!championship.isInPreparationPhase()) {
            throw new Error('Could not add a participant: inst in preparation');
        }

        if (championship.hasParticipantAlready(new Participant(participantID, judgeID, participant))) {
            throw new Error('Could not add a participant: already has it');
        }

        if (!participant.text) {
            throw new Error('Could not add a participant: empty name');
        }

        if (!permission.hasOwnerPermission(token) && championship.hasReachParticipantLimit(judgeID)) {
            throw new Error('Could not add a participant: has reach limit');
        }

        this.commandBus.dispatch(
            new AddParticipantCommand(
                championshipID,
                new Participant(participantID, judgeID, participant)
            )
        );

        return {
            participantID
        };
    }

    async likeParticipant({ championshipID, participantID, token }: any) {
        const [ championship, permission ] = await Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        const judgeID = permission.getJudgeID(token);

        if (!judgeID) {
            throw new Error('Dosent have judge for token');
        }

        if (!championship.isInPreparationPhase()) {
            throw new Error('Could not like a participant: inst in preparation');
        }

        if (championship.hasReachLikeLimit(judgeID, participantID)) {
            throw new Error('Could not like a participant: only 3 likes are allowed');
        }

        this.commandBus.dispatch(
            new LikeParticipantCommand(
                championshipID,
                judgeID,
                participantID
            )
        );

        return {
            championshipID,
            participantID
        };
    }

    async removeParticipantFromChampionship({ championshipID, participantID, token }: any) {
        const permission = await this.permissionRepository.get(championshipID);

        if (!permission.hasOwnerPermission(token)) {
            throw new Error('Only the owner can remove participants');
        }

        this.commandBus.dispatch(
            new RemoveParticipantCommand(
                championshipID,
                participantID
            )
        );

        return {
            championshipID,
            participantID
        };
    }

    async setJudgeReady({ championshipID, token }: any) {
        const permission = await this.permissionRepository.get(championshipID);
        const judgeID = permission.getJudgeID(token);

        this.commandBus.dispatch(
            new SetJudgeReadyCommand(
                championshipID,
                judgeID
            )
        );

        return {
            championshipID,
            judgeID
        };
    }

    async voteInParticipant({ championshipID, participantID, token }: any) {
        const [ championship, permission ] = await Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        const judgeID = permission.getJudgeID(token);

        if (!championship.isInVotingPhase()) {
            throw new Error('Could not vote for participant: isnt in voting phase');    
        }

        if (championship.hasJudgeAreadyVoted(judgeID)) {
            throw new Error('Could not vote for participant: already has voted');    
        }

        if (!championship.isParticipantInCurrentRound(participantID)) {
            throw new Error('Could not vote for participant: isnt in the current round');    
        }

        this.commandBus.dispatch(
            new VoteInParticipantCommand(
                championshipID,
                judgeID,
                participantID
            )
        );

        return {
            championshipID,
            participantID
        };
    }

    async startChampionship({ championshipID, token }: any) {
        const [ championship, permission ] = await Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        if (!championship.isInPreparationPhase()) {
            throw new Error('Cant start championship: isnt in praparation phase');
        }

        if (!championship.hasEnoughJudges()) {
            throw new Error('Cant start championship: dosent have enough judges');
        }

        if (!championship.hasEnoughParticipants()) {
            throw new Error('Cant start championship: dosent have enough participants');
        }

        if (!permission.hasOwnerPermission(token)) {
            throw new Error('Cant start championship: you isnt the owner');
        }

        if (!championship.hasAllJudgesReady()) {
            throw new Error('Cant start championship: all judges should be ready');
        }

        this.commandBus.dispatch(
            new StartChampionshipCommand(
                championshipID
            )
        );

        return {
            championshipID
        };
    }

    async restartChampionship({ championshipID, token }: any) {
        const [ championship, permission ] = await Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]);

        if (!championship.isInFinishPhase()) {
            throw new Error('Cant restart championship: isnt finished');
        }

        if (!permission.hasOwnerPermission(token)) {
            throw new Error('Cant restart championship: you isnt the owner');
        }

        this.commandBus.dispatch(
            new RestartChampionshipCommand(championshipID),
        );

        return {
            championshipID
        };
    }

    async validateInviteToken({ championshipID, token }: any) {
        const permission = await this.permissionRepository.get(championshipID);

        if (!permission.hasUserPermission(token)) {
            throw new Error('Invalid token for user');
        }

        if (!permission.hasValidInvite(token)) {
            throw new Error('Invalid invite');
        }

        await this.permissionRepository.useInviteToken(championshipID, token);

        return {
            championshipID,
            token
        }
    }

    async generateAnInviteLink({ championshipID, token }: any) {
        const permission = await this.permissionRepository.get(championshipID);
        const newToken = generateID();

        if (!permission.hasOwnerPermission(token)) {
            throw new Error('Cant generate invite for championship: you isnt the owner');
        }

        await this.permissionRepository.createInviteToken(championshipID, newToken);

        return {
            link: `/championship/${championshipID}/invite/${newToken}`,
            token: newToken
        }
    }

    async getChampionshipMeta({ championshipID, token }: any) {
        return Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]).then(([ championship, permission ]) => {
            return Promise.resolve({
                isAJudge: permission.getJudgeID(token),
                canEnter: championship.isInPreparationPhase() || permission.hasUserPermission(token),
            });
        });    
    }

    async getChampionshipInfo({ championshipID, token }: any) {
        return Promise.all([
            this.championshipRepository.get(championshipID),
            this.permissionRepository.get(championshipID)
        ]).then(([ championship, permission ]) => {
            return Promise.resolve(
                Object.assign({}, championship.getState(), {
                    whoVoted: championship.getJudgesThatHaveVoted(),
                    allReady: championship.hasAllJudgesReady(),
                    isOwner: permission.hasOwnerPermission(token),
                    hasVoted: championship.hasJudgeAreadyVoted(permission.getJudgeID(token)),
                    isReady: championship.isJudgeReady(permission.getJudgeID(token)),
                    judgeID: permission.getJudgeID(token)
                })
            );
        });
    }

}