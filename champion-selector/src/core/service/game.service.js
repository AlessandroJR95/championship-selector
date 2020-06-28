export class GameService {
    constructor(championshipRepository, roomRepository, permissionRepository, roomChampionshipRepository, judgeTokenRepository, clientInfoService) {
        this.championshipRepository = championshipRepository;
        this.roomRepository = roomRepository;
        this.permissionRepository = permissionRepository;
        this.roomChampionshipRepository = roomChampionshipRepository;
        this.judgeTokenRepository = judgeTokenRepository;
        this.clientInfoService = clientInfoService;

        this.roomRepository.onDisconnection().subscribe(({ roomID, clientID }) => {
            console.log('Trying cleanup user');
            try {
                const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
                this.removeJudgeCleanly({ championshipID, token: clientID });
            } catch (e) {
                console.log('error occured while disconecting: ', roomID, clientID, e);
            }
        });

        this.roomRepository.onRoomEmpty().subscribe(({ roomID, clientID }) => {
            console.log('Trying killing the room');
            try {
                this.killChampionship({ roomID });
            } catch (e) {
                console.log('error occured while killing championship room: ', roomID, clientID, e);
            }
        });

        this.permissionRepository.onLostOwnership().subscribe(({ championshipID }) => {
            console.log('Trying change ownership');
            try {
                if (this.championshipRepository.hasEnoughJudges({ championshipID })) {
                    const { token } = this.permissionRepository.changeOwnership({ championshipID });
                }
            } catch (e) {
                console.log('error occured while changing ownership');
            }
        });

        this.MAX_PARTICIPANTS_BY_JUDGE = 10;
    }

    removeJudgeCleanly({ token, championshipID }) {
        const { judgeID } = this.judgeTokenRepository.getJudgeID({ token, championshipID });
        this.championshipRepository.removeJudgeFromChampionship({ championshipID, judgeID });
        this.permissionRepository.removeToken({ championshipID, token });
        this.judgeTokenRepository.removeToken({ championshipID, token });
    }

    createChampionship() {
        const { roomID } = this.roomRepository.createRoom();
        const { championshipID } = this.championshipRepository.createChampionship();
        const { token } = this.permissionRepository.createOwnerToken({ championshipID });
        
        this.roomChampionshipRepository.assignChampionshipToRoom({ roomID, championshipID });

        this.championshipRepository.subscribeToChampionship({ 
            championshipID,
            observable: {
                next: (data) => this.roomRepository.sendToRoom({ roomID, data })
            }
        });

        return {
            roomID,
            token,
            success: true
        };
    }

    enterInChampionshipAsJudge({ roomID, judge, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID })
        const isInPreparation = this.championshipRepository.isInPreparationPhase({ championshipID });
        let permissionToken = null;

        if (!isInPreparation) {
            throw new Error('Cant connect in a room that isnt in preparation');
        }

        if (!judge || !judge.name) {
            throw new Error('Cant connect to the room without a name');
        }

        if (this.permissionRepository.hasOwnerPermission({ championshipID, token })) {
            permissionToken = token;
        } else {
            const permission = this.permissionRepository.createUserToken({ championshipID });
            permissionToken = permission.token;
        }

        const { judgeID } = this.championshipRepository.addJudgeToChampionship({
            championshipID,
            judge: {
                name: judge.name,
                icon: judge.icon,
                isReady: false
            }
        });

        this.judgeTokenRepository.assignJudgeIDToToken({ token: permissionToken, judgeID, championshipID });

        return {
            token: permissionToken,
            success: true
        };
    }

    removeJudgeFromChampionship({ roomID, token, judgeID }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const isInPreparation = this.championshipRepository.isInPreparationPhase({ championshipID });
        const targetToken = this.judgeTokenRepository.getJudgeToken({ championshipID, judgeID});

        if (!this.permissionRepository.hasOwnerPermission({ championshipID, token })) {
            throw new Error('Only the owner can remove judges');
        }

        if (!isInPreparation) {
            throw new Error('Could not remove judge: inst in preparation');
        }

        if (targetToken === token) {
            throw new Error('You cant remove yourself');
        }

        this.removeJudgeCleanly({ 
            championshipID,
            token: targetToken
        });

        this.roomRepository.notifyError({ roomID, clientID: targetToken, data: new Error('You got kicked') });

        return {
            success: true
        };
    }

    isAJudge({ roomID, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        return this.judgeTokenRepository.hasJudgeID({ championshipID, token });
    }

    canEnterInChampionship({ roomID }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        return this.championshipRepository.isInPreparationPhase({ championshipID });
    }

    subscribeToRoom({ roomID, token, observable, prepare }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });

        if (!this.permissionRepository.hasUserPermission({ championshipID, token })) {
            throw new Error('Dosent have permission to subscribe to room');
        }

        if (this.roomRepository.hasConnectedClient({ roomID, clientID: token })) {
            throw new Error('Already has a connected client');
        }

        const subscription = this.roomRepository.subscribeToRoom({
            roomID,
            clientID: token,
            prepare,
            observable: {
                next: (data) => observable.next(Object.assign({}, data, this.clientInfoService.getInfo({ roomID, token }))),
                error: observable.error,
                complete: observable.complete
            },
        });

        return subscription;
    }

    killChampionship({ roomID }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID })

        this.roomChampionshipRepository.remove({ roomID });
        this.roomRepository.remove({ roomID });

        if (championshipID) {
            this.championshipRepository.remove({ championshipID });
            this.permissionRepository.remove({ championshipID });
            this.judgeTokenRepository.remove({ championshipID });
        }
    }

    hasReachParticipantsLimit({ championshipID, judgeID }) {
        return this.championshipRepository.getJudgeParticipants({ championshipID, judgeID }).length >= this.MAX_PARTICIPANTS_BY_JUDGE;
    }

    addParticipantInChampionship({ roomID, participant, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const { judgeID } = this.judgeTokenRepository.getJudgeID({ token, championshipID });
        const isInPreparation = this.championshipRepository.isInPreparationPhase({ championshipID });
        const alreadyHasParticipant = this.championshipRepository.hasParticipantAlready({ championshipID, participant });
        const hasReachParticipantsLimit = this.hasReachParticipantsLimit({ championshipID, judgeID });
        const isOwner = this.permissionRepository.hasOwnerPermission({ championshipID, token });

        if (!isInPreparation) {
            throw new Error('Could not add a participant: inst in preparation');
        }

        if (alreadyHasParticipant) {
            throw new Error('Could not add a participant: already has it');
        }

        if (!participant.text) {
            throw new Error('Could not add a participant: empty name');
        }

        if (!isOwner && hasReachParticipantsLimit) {
            throw new Error('Could not add a participant: has reach limit');
        }

        const { participantID } = this.championshipRepository.addParticipantInChampionship({ championshipID, judgeID, participant });

        return {
            success: true,
            participantID
        };
    }

    removeParticipantFromChampionship({ roomID, participantID, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });

        if (!this.permissionRepository.hasOwnerPermission({ championshipID, token })) {
            throw new Error('Only the owner can remove participants');
        }

        this.championshipRepository.removeParticipantFromChampionship({ championshipID, participantID });

        return {
            success: true
        }
    }

    setJudgeReady({ roomID, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const { judgeID } = this.judgeTokenRepository.getJudgeID({ token, championshipID });

        this.championshipRepository.setReadyJudge({ championshipID, judgeID });

        return {
            success: true
        };
    }

    voteInParticipant({ roomID, token, participant }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const { judgeID } = this.judgeTokenRepository.getJudgeID({ token, championshipID });
        const alreadyVoted = this.championshipRepository.hasJudgeAreadyVoted({ championshipID, judgeID });
        const isInVotingPhase = this.championshipRepository.isInVotingPhase({ championshipID });

        if (!isInVotingPhase) {
            throw new Error('Could not vote for participant: isnt in voting phase');    
        }

        if (alreadyVoted) {
            throw new Error('Could not vote for participant: already has voted');    
        }

        this.championshipRepository.voteInParticipant({ championshipID, judgeID, participant });

        return {
            success: true
        };
    }

    hasChampionship({ roomID }) {
        return this.roomChampionshipRepository.hasChampionship({ roomID });
    }

    startChampionship({ roomID, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const isInPreparation = this.championshipRepository.isInPreparationPhase({ championshipID });
        const hasEnoughJudges = this.championshipRepository.hasEnoughJudges({ championshipID });
        const hasEnoughParticipants = this.championshipRepository.hasEnoughParticipants({ championshipID });
        const isOwner = this.permissionRepository.hasOwnerPermission({ championshipID, token });
        const isAllReady = this.championshipRepository.allJudgesReady({ championshipID });

        if (!isInPreparation) {
            throw new Error('Cant start championship: isnt in praparation phase');
        }

        if (!hasEnoughJudges) {
            throw new Error('Cant start championship: dosent have enough judges');
        }

        if (!hasEnoughParticipants) {
            throw new Error('Cant start championship: dosent have enough participants');
        }

        if (!isOwner) {
            throw new Error('Cant start championship: you isnt the owner');
        }

        if (!isAllReady) {
            throw new Error('Cant start championship: all judges should be ready');
        }

        this.championshipRepository.startChampionship({ championshipID });

        return {
            success: true
        };
    }

    restartChampionship({ roomID, token }) {
        const { championshipID } = this.roomChampionshipRepository.getChampionshipID({ roomID });
        const isOwner = this.permissionRepository.hasOwnerPermission({ championshipID, token });
        const isInFinishPhase = this.championshipRepository.isInFinishPhase({ championshipID });

        if (!isInFinishPhase) {
            throw new Error('Cant restart championship: isnt finished');
        }

        if (!isOwner) {
            throw new Error('Cant restart championship: you isnt the owner');
        }

        this.championshipRepository.restartChampionship({ championshipID });

        return {
            success: true
        };
    }
}