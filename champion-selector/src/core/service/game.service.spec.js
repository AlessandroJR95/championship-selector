import { Subject } from 'rxjs';
import { GameService } from './game.service';
import { ChampionshipRepository } from '../repository/championship.repository';
import { RoomRepository } from '../repository/room.repository';
import { RoomChampionshipRepository } from '../repository/roomchampionship.repository';
import { PermissionRepository } from '../repository/permission.repository';
import { JudgeTokenRepository } from '../repository/judgetoken.repository';
import { ClientInfoService } from '../service/client.info.service'
import { bufferCount } from 'rxjs/operators';


describe('GameService tests', () => {
    let gameService;
    let championshipRepository;
    let roomRepository;
    let permissionRepository;
    let roomChampionshipRepository;
    let judgeTokenRepository;
    let clientInfoService;

    beforeEach(() => {
        championshipRepository = new ChampionshipRepository();
        roomRepository = new RoomRepository();
        roomChampionshipRepository = new RoomChampionshipRepository();
        permissionRepository = new PermissionRepository();
        judgeTokenRepository = new JudgeTokenRepository();

        clientInfoService = new ClientInfoService(
            championshipRepository,
            permissionRepository,
            roomChampionshipRepository,
            judgeTokenRepository
        );

        gameService = new GameService(
            championshipRepository,
            roomRepository,
            permissionRepository,
            roomChampionshipRepository,
            judgeTokenRepository,
            clientInfoService
        );
    });

    describe('Championsip creation', () => {
        it('should create championship', () => {
            const championshipLength = championshipRepository.championships.size;

            gameService.createChampionship();

            expect(championshipRepository.championships.size).toEqual(championshipLength + 1);
        });

        it('should create championship room', () => {
            const roomsLength = roomRepository.rooms.size;

            gameService.createChampionship();

            expect(roomRepository.rooms.size).toEqual(roomsLength + 1);
        });

        it('should create championship permissions', () => {
            const { roomID, token } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })
            expect(permissionRepository.hasOwnerPermission({ championshipID, token })).toEqual(true);
            expect(permissionRepository.hasUserPermission({ championshipID, token })).toEqual(true);
        });

        it('should create user permission if token is invalid', () => {
            const { roomID } = gameService.createChampionship();
            const fakeToken = 'this token dosent exists in this champinship';

            expect(gameService.isAJudge({ roomID, token: fakeToken })).toEqual(false);

            const { token } = gameService.enterInChampionshipAsJudge({
                roomID,
                token: fakeToken,
                judge: {
                    name: 'Ale',
                    icon: 'thumb'
                }
            });

            expect(gameService.isAJudge({ roomID, token })).toEqual(true);
        })

        it('should broadcast championship to room', (done) => {
            const { roomID, token } = gameService.createChampionship();

            const obs = new Subject();

            obs.pipe(bufferCount(2)).subscribe(
                (data) => {
                    expect(data[1].judges[0].name).toEqual('Ale');
                    done();
                },
                (e) => {
                    console.error(e);
                }
            );

            roomRepository.subscribeToRoom({
                roomID,
                observable: {
                    next: obs.next.bind(obs)
                }
            });

            gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Ale',
                    icon: 'thumb'
                }
            });
        });

        it('should get championship from room', () => {
            const { roomID, token } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })
            expect(permissionRepository.hasOwnerPermission({ championshipID, token })).toEqual(true);
        });

        it('should clear all championship related entities', () => {
            const { roomID } = gameService.createChampionship();

            expect(roomChampionshipRepository.roomChampionship.size).toEqual(1);
            expect(roomRepository.rooms.size).toEqual(1);
            expect(championshipRepository.championships.size).toEqual(1);
            expect(permissionRepository.permissions.size).toEqual(1);

            gameService.killChampionship({ roomID });

            expect(roomChampionshipRepository.roomChampionship.size).toEqual(0);
            expect(roomRepository.rooms.size).toEqual(0);
            expect(championshipRepository.championships.size).toEqual(0);
            expect(permissionRepository.permissions.size).toEqual(0);
        });

        it('should add participants', () => {
            const { roomID } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const { token } = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Ale',
                    icon: 'thumb'
                }
            });

            gameService.addParticipantInChampionship({
                roomID,
                token,
                participant: {
                    text: 'Teste'
                }
            });

            const participants = championshipRepository.getParticipants({ championshipID });

            expect(participants[0].text).toEqual("Teste");

            expect(() => {
                gameService.addParticipantInChampionship({
                    roomID,
                    token,
                    participant: {
                        text: 'Teste'
                    }
                });
            }).toThrow('Could not add a participant: already has it');

            expect(() => {
                gameService.addParticipantInChampionship({
                    roomID,
                    token,
                    participant: {
                        text: ''
                    }
                });
            }).toThrow('Could not add a participant: empty name');
        });

        it('should limit user participants but not the owner', () => {
            gameService.MAX_PARTICIPANTS_BY_JUDGE = 1;
            const championship = gameService.createChampionship();
            const roomID = championship.roomID;
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            gameService.enterInChampionshipAsJudge({
                roomID,
                token: championship.token,
                judge: {
                    name: 'Mabi',
                    icon: 'thumb'
                }
            });

            const { token } = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Ale',
                    icon: 'thumb'
                }
            });

            gameService.addParticipantInChampionship({
                roomID,
                token,
                participant: {
                    text: 'Teste'
                }
            });

            expect(() => {
                gameService.addParticipantInChampionship({
                    roomID,
                    token,
                    participant: {
                        text: 'Teste 1'
                    }
                });
            }).toThrow('Could not add a participant: has reach limit');

            gameService.addParticipantInChampionship({
                roomID,
                token: championship.token,
                participant: {
                    text: 'Teste 2'
                }
            });

            gameService.addParticipantInChampionship({
                roomID,
                token: championship.token,
                participant: {
                    text: 'Teste 3'
                }
            });

            expect(championshipRepository.getParticipants({ championshipID }).length).toEqual(3);
        });
    });

    describe('Championship connection tests', ()  => {
        it('should change ownership when owner has disconected', () => {
            jest.useFakeTimers();

            const { roomID, token } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const client = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client',
                    icon: 'thumb'
                }
            });

            const owner = gameService.enterInChampionshipAsJudge({
                roomID,
                token,
                judge: {
                    name: 'Owner',
                    icon: 'thumb'
                }
            });

            const queue = new Subject();
            const ownerConnection = gameService.subscribeToRoom({ roomID, token, observable: queue });
            gameService.subscribeToRoom({ roomID, token: client.token, observable: queue });

            expect(permissionRepository.hasOwnerPermission({ championshipID, token })).toEqual(true);
            expect(championshipRepository.allJudgesReady({ championshipID })).toEqual(false);

            ownerConnection.disconnect();

            jest.runOnlyPendingTimers();

            expect(permissionRepository.hasOwnerPermission({ championshipID, token })).toEqual(false);
            expect(permissionRepository.hasOwnerPermission({ championshipID, token: client.token })).toEqual(true);
            expect(championshipRepository.allJudgesReady({ championshipID })).toEqual(true);
        });

        it('should remove client from championship after some time disconnected', () => {
            jest.useFakeTimers();

            const { roomID } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const firstClient = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client',
                    icon: 'thumb'
                }
            });

            const client = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            const queue = new Subject();
            gameService.subscribeToRoom({ roomID, token: firstClient.token, observable: queue });
            const clientConnection = gameService.subscribeToRoom({ roomID, token: client.token, observable: queue });

            expect(gameService.isAJudge({ roomID, token: client.token })).toEqual(true);
            expect(permissionRepository.hasUserPermission({ championshipID, token: client.token })).toEqual(true);
            expect(championshipRepository.getJudges({ championshipID }).length).toEqual(2);

            clientConnection.disconnect();

            jest.runOnlyPendingTimers();

            expect(championshipRepository.getJudges({ championshipID }).length).toEqual(1);
            expect(gameService.isAJudge({ roomID, token: client.token })).toEqual(false);
            expect(permissionRepository.hasUserPermission({ championshipID, token: client.token })).toEqual(false);
        });

        it('should not remove client when reconnecting', () => {
            jest.useFakeTimers();

            const { roomID } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const firstClient = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client',
                    icon: 'thumb'
                }
            });

            const client = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            const queue = new Subject();
            gameService.subscribeToRoom({ roomID, token: firstClient.token, observable: queue });
            const clientConnection = gameService.subscribeToRoom({ roomID, token: client.token, observable: queue });

            expect(gameService.isAJudge({ roomID, token: client.token })).toEqual(true);
            expect(permissionRepository.hasUserPermission({ championshipID, token: client.token })).toEqual(true);
            expect(championshipRepository.getJudges({ championshipID }).length).toEqual(2);

            clientConnection.disconnect();

            gameService.subscribeToRoom({ roomID, token: client.token, observable: queue });

            jest.runOnlyPendingTimers();

            expect(gameService.isAJudge({ roomID, token: client.token })).toEqual(true);
            expect(permissionRepository.hasUserPermission({ championshipID, token: client.token })).toEqual(true);
            expect(championshipRepository.getJudges({ championshipID }).length).toEqual(2);
        });

        it('should kill championship when room is empty', () => {
            jest.useFakeTimers();

            const championship = gameService.createChampionship();
            const roomID = championship.roomID;
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const { token } = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            gameService.enterInChampionshipAsJudge({
                roomID,
                token: championship.token,
                judge: {
                    name: 'Client Owner',
                    icon: 'thumb'
                }
            });

            const queue = new Subject();
            const clientConnection = gameService.subscribeToRoom({ roomID, token, observable: queue });
            const ownerConnection = gameService.subscribeToRoom({ roomID, token: championship.token, observable: queue });

            expect(roomChampionshipRepository.hasChampionship({ roomID })).toEqual(true);
            expect(judgeTokenRepository.hasJudgeID({ championshipID, token })).toEqual(true);
            expect(roomRepository.getRoom({ roomID })).toBeDefined();
            expect(championshipRepository.getChampionship({ championshipID })).toBeDefined();
            expect(permissionRepository.getPermission({ championshipID, token })).toBeDefined();
            
            ownerConnection.disconnect();

            jest.runOnlyPendingTimers();

            expect(roomChampionshipRepository.hasChampionship({ roomID })).toEqual(true);
            expect(judgeTokenRepository.hasJudgeID({ championshipID, token })).toEqual(true);
            expect(roomRepository.getRoom({ roomID })).toBeDefined();
            expect(championshipRepository.getChampionship({ championshipID })).toBeDefined();
            expect(permissionRepository.getPermission({ championshipID, token })).toBeDefined();

            clientConnection.disconnect();

            jest.runOnlyPendingTimers();

            expect(roomChampionshipRepository.hasChampionship({ roomID })).toEqual(false);
            expect(judgeTokenRepository.hasJudgeID({ championshipID, token })).toEqual(false);
            expect(() => roomRepository.getRoom({ roomID })).toThrow('Could not get room');
            expect(() => championshipRepository.getChampionship({ championshipID })).toThrow('Championshp not found')
            expect(() => permissionRepository.getPermission({ championshipID, token })).toThrow('Permission not found');            
        });

        it('should kill championship when room was created but no one entered', () => {
            jest.useFakeTimers();

            const championship = gameService.createChampionship();
            const roomID = championship.roomID;
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            expect(roomChampionshipRepository.hasChampionship({ roomID })).toEqual(true);
            expect(roomRepository.getRoom({ roomID })).toBeDefined();
            expect(championshipRepository.getChampionship({ championshipID })).toBeDefined();

            jest.runOnlyPendingTimers();

            expect(roomChampionshipRepository.hasChampionship({ roomID })).toEqual(false);         
            expect(() => championshipRepository.getChampionship({ championshipID })).toThrow('Championshp not found');
            expect(() => roomRepository.getRoom({ roomID })).toThrow('Could not get room');
        });

        it('should not connect to a room if already has a connection', () => {
            const { roomID } = gameService.createChampionship();

            const { token } = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            const queue = new Subject();
            gameService.subscribeToRoom({ roomID, token, observable: queue });
            expect(() => gameService.subscribeToRoom({ roomID, token, observable: queue })).toThrow('Already has a connected client');
        });

        it('should not connect to a room if dosent have permission', () => {
            const { roomID } = gameService.createChampionship();

            const queue = new Subject();
            expect(() => gameService.subscribeToRoom({ roomID, token: '', observable: queue })).toThrow('Dosent have permission to subscribe to room');
        });

        it('should not remove judge if its not the owner', () => {
            const { roomID } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const { token } = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            const { judgeID } = judgeTokenRepository.getJudgeID({ token, championshipID });

            expect(() => gameService.removeJudgeFromChampionship({ roomID, token, judgeID })).toThrow('Only the owner can remove judges');
        });

        it('should remove judge', (done) => {
            const { roomID, token } = gameService.createChampionship();
            const { championshipID } = roomChampionshipRepository.getChampionshipID({ roomID })

            const clientConnection = gameService.enterInChampionshipAsJudge({
                roomID,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            gameService.enterInChampionshipAsJudge({
                roomID,
                token,
                judge: {
                    name: 'Client 2',
                    icon: 'thumb'
                }
            });

            gameService.subscribeToRoom({ 
                roomID,
                token: clientConnection.token,
                observable: {
                    next: () => {},
                    error: (e) => {
                        expect(e.message).toEqual('You got kicked');
                        done();
                    }
                }
            });

            const { judgeID } = judgeTokenRepository.getJudgeID({ token: clientConnection.token, championshipID });

            expect(championshipRepository.getJudges({ championshipID }).length).toEqual(2);

            gameService.removeJudgeFromChampionship({ roomID, token, judgeID });

            expect(championshipRepository.getJudges({ championshipID }).length).toEqual(1);
        });
    });

    describe('Championship flow tests', () => {
        let gameServiceFlow;
        let championshipRepositoryFlow;
        let roomRepositoryFlow;
        let permissionRepositoryFlow;
        let roomChampionshipRepositoryFlow;
        let judgeTokenRepositoryFlow;
        let clientInfoServiceFlow;
        let championshipID;
        let ownerToken;
        let roomID;
        let judgeList = [];
        let participantList = [];
        let roomState = new Map();

        beforeAll(() => {
            championshipRepositoryFlow = new ChampionshipRepository();
            roomRepositoryFlow = new RoomRepository();
            roomChampionshipRepositoryFlow = new RoomChampionshipRepository();
            permissionRepositoryFlow = new PermissionRepository();
            judgeTokenRepositoryFlow = new JudgeTokenRepository();

            clientInfoServiceFlow = new ClientInfoService(
                championshipRepositoryFlow,
                permissionRepositoryFlow,
                roomChampionshipRepositoryFlow,
                judgeTokenRepositoryFlow
            );
    
            gameServiceFlow = new GameService(
                championshipRepositoryFlow,
                roomRepositoryFlow,
                permissionRepositoryFlow,
                roomChampionshipRepositoryFlow,
                judgeTokenRepositoryFlow,
                clientInfoServiceFlow
            );

            const championshipInfo = gameServiceFlow.createChampionship();
            const roomChampionship = roomChampionshipRepositoryFlow.getChampionshipID({ roomID: championshipInfo.roomID });

            championshipID = roomChampionship.championshipID;
            roomID = championshipInfo.roomID;
            ownerToken = championshipInfo.token;
        });

        it('should return true if has championship', () => {
            expect(gameServiceFlow.hasChampionship({ roomID })).toEqual(true);
        });

        it('should not start championship if dosent have judges', () => {
            expect(() => gameServiceFlow.startChampionship({ roomID, token: ownerToken })).toThrow('Cant start championship: dosent have enough judges');
        });

        it('should add judges', () => {
            judgeList.push(
                gameServiceFlow.enterInChampionshipAsJudge({
                    roomID,
                    judge: {
                        name: 'Ale',
                        icon: 'truta'
                    }
                })
            );

            judgeList.push(
                gameServiceFlow.enterInChampionshipAsJudge({
                    roomID,
                    token: ownerToken,
                    judge: {
                        name: 'Mabi',
                        icon: 'heart'
                    }
                })
            );

            expect(() => {
                gameServiceFlow.enterInChampionshipAsJudge({
                    roomID,
                    judge: {
                        name: '',
                        icon: 'heart'
                    }
                });
            }).toThrow('Cant connect to the room without a name');

            const judges = championshipRepositoryFlow.getJudges({ championshipID });

            expect(judges[0].name).toEqual('Ale');
            expect(judges[0].icon).toEqual('truta');
            expect(judges[0].id).toBeDefined();
        });

        it('should subscribe judges to rooms', () => {
            judgeList.forEach((judge) => {
                gameServiceFlow.subscribeToRoom({ 
                    roomID,
                    token: judge.token,
                    observable: {
                        next: (state) => {
                            roomState.set(judge.token, state);
                        }
                    }
                });
            });

            expect(roomState.get(judgeList[0].token).judges[0].name).toEqual("Ale");
            expect(roomState.get(judgeList[0].token).judges[1].name).toEqual("Mabi");
        });

        it('should not start championship if dosent have participants', () => {
            expect(() => gameServiceFlow.startChampionship({ roomID, token: ownerToken })).toThrow('Cant start championship: dosent have enough participants');
        });

        it('should add participants', () => {
            gameServiceFlow.MAX_PARTICIPANTS_BY_JUDGE = 5;

            participantList.push(
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste'
                    }
                })
            );

            participantList.push(
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 2'
                    }
                })
            );

            participantList.push(
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 3'
                    }
                })
            );

            participantList.push(
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 4'
                    }
                })
            );

            participantList.push(
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 5'
                    }
                })
            );

            expect(() => {
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 6'
                    }
                });
            }).toThrow('Could not add a participant: has reach limit');

            const participants = championshipRepositoryFlow.getParticipants({ championshipID });
            
            expect(participants[0].text).toEqual('Teste');
            expect(participants[1].text).toEqual('Teste 2');
        });

        it('should remove participant if its owner', () => {
            expect(championshipRepositoryFlow.getParticipants({ championshipID }).length).toEqual(5);

            gameServiceFlow.removeParticipantFromChampionship({ roomID, token: ownerToken, participantID: participantList.pop().participantID  });

            expect(championshipRepositoryFlow.getParticipants({ championshipID }).length).toEqual(4);
            
            participantList.push(
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 5'
                    }
                })
            );

            expect(championshipRepositoryFlow.getParticipants({ championshipID }).length).toEqual(5);
        });

        it('should not remove participant if its owner', () => {
            const participants = championshipRepositoryFlow.getParticipants({ championshipID });

            expect(participants.length).toEqual(5);

            expect(() => {
                gameServiceFlow.removeParticipantFromChampionship({ roomID, token: judgeList[0].token, participantID: participants[0].id  });
            }).toThrow('Only the owner can remove participants');
        });

        it('should not add participant without permission', () => {
            expect(() => {
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    participant: {
                        text: 'Teste 2'
                    }
                });
            }).toThrow('Dosent have judge for token');
        });

        it('should not vote in participant if championship hasnt started', () => {
            expect(() => {
                gameServiceFlow.voteInParticipant({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste'
                    }
                });
            }).toThrow('Could not vote for participant: isnt in voting phase');
        });

        it('should not start championship without owner token', () => {
            expect(() => gameServiceFlow.startChampionship({ roomID, token: judgeList[0].token })).toThrow('Cant start championship: you isnt the owner');
        });

        it('should not start championship if someone isnt ready', () => {
            expect(() => gameServiceFlow.startChampionship({ roomID, token: ownerToken })).toThrow('Cant start championship: all judges should be ready');
        });

        it('should not remove judge if it is yourself', () => {
            const { judgeID }  = judgeTokenRepositoryFlow.getJudgeID({ token: ownerToken, championshipID });
            expect(() => gameServiceFlow.removeJudgeFromChampionship({ roomID, token: ownerToken, judgeID })).toThrow('You cant remove yourself');
        });

        it('should get judges ready', () => {
            judgeList.forEach((judge) => {
                gameServiceFlow.setJudgeReady({ roomID, token: judge.token });
            });
        
            judgeList.forEach((judge) => {
                expect(roomState.get(judge.token).allReady).toEqual(true);
            });
        });

        it('should start championship', () => {
            gameServiceFlow.startChampionship({ roomID, token: ownerToken });
            expect(championshipRepositoryFlow.isInVotingPhase({ championshipID })).toEqual(true);
        });

        it('should not enter in championship that already started', () => {
            expect(() => {
                gameServiceFlow.enterInChampionshipAsJudge({
                    roomID,
                    judge: {
                        name: 'Mabi',
                        icon: 'heart'
                    }
                });
            }).toThrow('Cant connect in a room that isnt in preparation');
        });

        it('should not start championship when is not in preparation', () => {
            expect(() => gameServiceFlow.startChampionship({ roomID, token: ownerToken })).toThrow('Cant start championship: isnt in praparation phase');
        });

        it('should not add in participant if championship has started', () => {
            expect(() => {
                gameServiceFlow.addParticipantInChampionship({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste 2'
                    }
                });
            }).toThrow('Could not add a participant: inst in preparation');
        });

        it('should not remove judge if championship has started', () => {
            const { judgeID }  = judgeTokenRepositoryFlow.getJudgeID({ token: judgeList[0].token, championshipID });
            expect(() => gameServiceFlow.removeJudgeFromChampionship({ roomID, token: ownerToken, judgeID })).toThrow('Could not remove judge: inst in preparation');
        });

        it('should NOT get voted flag in subscription', () => {
            expect(roomState.get(judgeList[0].token).hasVoted).toEqual(false);
        })

        it('should vote in participant', () => {
            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[0].token,
                participant: {
                    text: 'Teste',
                    participantID: participantList[0].participantID
                }
            });
            
            const votes = championshipRepositoryFlow.getVotes({ championshipID });

            expect(votes[0][0].participant).toEqual({ text: "Teste", participantID: participantList[0].participantID });
            expect(votes[0][0].judgeID).toBeDefined();
        });

        it('should get voted flag in subscription', () => {
            expect(roomState.get(judgeList[0].token).hasVoted).toEqual(true);
        });

        it('should get judge list state with judge voted list', () => {
            const { judgeID } = judgeTokenRepositoryFlow.getJudgeID({ token: judgeList[0].token, championshipID });
            expect(roomState.get(judgeList[0].token).whoVoted).toEqual([judgeID]);
        });

        it('should NOT restart championship state', () => {
            expect(() => {
                gameServiceFlow.restartChampionship({ roomID, token: judgeList[0].token })
            }).toThrow('Cant restart championship: isnt finished');
        });

        it('should not vote without permission', () => {
            expect(() => {
                gameServiceFlow.voteInParticipant({
                    roomID,
                    token: '',
                    participant: {
                        text: 'Teste',
                        participantID: '1'
                    }
                });
            }).toThrow('Dosent have judge for token');
        });

        it('should not vote twice', () => {
            expect(() => {
                gameServiceFlow.voteInParticipant({
                    roomID,
                    token: judgeList[0].token,
                    participant: {
                        text: 'Teste',
                        participantID: '1'
                    }
                });
            }).toThrow('Could not vote for participant: already has voted');
        });

        it('should have a round winner', () => {
            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[1].token,
                participant: {
                    text: 'Teste',
                    participantID: participantList[0].participantID
                }
            });

            expect(championshipRepositoryFlow.getLastRoundWinner({ championshipID }).participant.text).toEqual("Teste");
        });

        it('should have a championship winner', () => {
            let round = championshipRepositoryFlow.getCurrentRound({ championshipID });

            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[0].token,
                participant: {
                    text: round[0].text,
                    participantID: round[0].participantID
                }
            });

            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[1].token,
                participant: {
                    text: round[0].text,
                    participantID: round[0].participantID
                }
            });

            round = championshipRepositoryFlow.getCurrentRound({ championshipID });

            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[0].token,
                participant: {
                    text: round[0].text,
                    participantID: round[0].participantID
                }
            });

            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[1].token,
                participant: {
                    text: round[0].text,
                    participantID: round[0].participantID
                }
            });

            round = championshipRepositoryFlow.getCurrentRound({ championshipID });

            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[0].token,
                participant: {
                    text: round[0].text,
                    participantID: round[0].participantID
                }
            });

            gameServiceFlow.voteInParticipant({
                roomID,
                token: judgeList[1].token,
                participant: {
                    text: round[0].text,
                    participantID: round[0].participantID
                }
            });

            round = championshipRepositoryFlow.getWinner({ championshipID });

            expect(round.participant.text).toEqual("Teste 3");
        });

        it('should NOT restart championship state', () => {
            expect(() => {
                gameServiceFlow.restartChampionship({ roomID, token: judgeList[0].token })
            }).toThrow('Cant restart championship: you isnt the owner');
        });

        it('should restart championship state', () => {
            expect(championshipRepositoryFlow.isInFinishPhase({ championshipID })).toEqual(true);
            expect(championshipRepositoryFlow.allJudgesReady({ championshipID })).toEqual(true);

            gameServiceFlow.restartChampionship({ roomID, token: ownerToken });

            expect(championshipRepositoryFlow.isInFinishPhase({ championshipID })).toEqual(false);
            expect(championshipRepositoryFlow.isInPreparationPhase({ championshipID })).toEqual(true);
            expect(championshipRepositoryFlow.allJudgesReady({ championshipID })).toEqual(false);
        });
    });
});