import React from 'react';
import Connector from './connector';
import { useLoadingContext } from './Loading'

const ClientStateContext = React.createContext();
const ClientActionContext = React.createContext();

export const phases = {
    FINISH_CHAMPIONSHIP: 'FINISH_CHAMPIONSHIP',
    START_MATCHUP_VOTE: 'START_MATCHUP_VOTE',
    END_MATCHUP_VOTE: 'END_MATCHUP_VOTE',
    PREPARATION: 'PREPARATION',
    ENTERING: 'ENTERING',
    ERROR: 'ERROR',
    LOADING: 'LOADING'
}

const actionType = {
    CHANGE_PHASE: 'CHANGE_PHASE',
    ERROR_PHASE: 'ERROR_PHASE',
    BLOCK_INPUT: 'BLOCK_INPUT',
    SYNC_STATE: 'SYNC_STATE',
    FREE_INPUT: 'FREE_INPUT',
    WILL_BLOCK_INPUT: 'WILL_BLOCK_INPUT'
};

const clientReducer = (state, action) => {
    switch (action.type) {
        case actionType.SYNC_STATE:
            console.log(action.payload);
            return Object.assign({}, state, action.payload);
        case actionType.CHANGE_PHASE:
            return Object.assign({}, state, { phase: action.payload.phase });
        case actionType.WILL_BLOCK_INPUT:
            return Object.assign({}, state, { willBlockInput: true });
        case actionType.BLOCK_INPUT:
            return Object.assign({}, state, { canInput: false });
        case actionType.FREE_INPUT:
            return Object.assign({}, state, { canInput: true, willBlockInput: false });
        case actionType.ERROR_PHASE:
            return Object.assign({}, state, {
                phase: phases.ERROR,
                errorMessage: action.payload.message
            });
        default: 
            return state;
    }
};

const clientInitialState = {
    canInput: true,
};

function getRoundHistory(winners, rounds) {
    if (!winners || !winners.length || !rounds) {
        return [
            {
                round: '-',
                winner: '-',
                loser: '-'
            }
        ];
    }

    return winners.map((winner, index) => {
        const loser = rounds[index].find((participant) => participant.participantID !== winner.participant.participantID);

        return {
            round: index + 1,
            winner: winner.participant.data.text,
            loser: loser.data.text
        }
    });
}

function calculatePoints(winners, votes, likes, judgeID) {
    const judgePointMap = new Map(likes.filter((like) => like.judge.judgeID === judgeID).map((like) => [like.participant.participantID, true]));

    const votePoints = votes.reduce((sum, round) => {
        return round.reduce((acc, vote) => {
            return judgePointMap.get(vote.participant.participantID) ? acc + 1 : acc;
        }, sum);
    }, 0);

    const winnerPoints = winners.reduce((sum, winner) => {
        return judgePointMap.get(winner.participant.participantID) ? sum + 5 : sum;
    }, 0);

    return winnerPoints + votePoints;
}

function getScoreboard(winners, votes, judges, likes) {
    if (!judges) {
        return [];
    }

    return judges.reduce((scoreboard, judge) => {
        const points = calculatePoints(winners, votes, likes, judge.judgeID);

        return scoreboard.concat({
            id: judge.judgeID,
            name: judge.name,
            points,
            text: points
        });
    }, []).sort((a, b) => a.points > b.points ? -1 : 1);
}

function getLikeList(participantList, likeList, judgeID) {
    const participants = participantList || [];
    const likes = likeList || [];
    const participantsLookup = new Map(participants.map((p) => [p.participantID, p.data.text]));
    return likes.filter((like) => like.judge.judgeID === judgeID).map((like) => participantsLookup.get(like.participant.participantID));
}

function getRound(clientState) {
    return clientState.rounds ? clientState.rounds[clientState.round] : null;
}

function getChampionshipProgress(clientState) {
    return clientState.participants ? (clientState.round / (clientState.participants.length - 2)) * 100 : 0;
}

function getRoundName(participantsList, actualRound) {
    const participantsLength = participantsList ? participantsList.length : 0;
    const isFinalRound = participantsLength - 2 === actualRound;
    const isSemiFinalRound = participantsLength - 3 === actualRound;

    if (isFinalRound) return "Final";
    if (isSemiFinalRound) return "Semi Final";
}

function useClientState(props) {
    const connectionRef = React.useRef({ connection: null });
    const [ clientState, dispatch ] = React.useReducer(clientReducer, clientInitialState);

    const { championshipID, setLoading, getState, getActions } = props;

    const actions = React.useMemo(() => {
        return {
            startChampionship: () => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });
                setLoading(true);

                Connector.startChampionship({ championshipID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            addParticipant: (participantName) => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });
                setLoading(true);

                Connector.addParticipantInChampionship({ championshipID, participantName }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            addVote: (participant) => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });

                Connector.voteInParticipant({ championshipID, participant }).catch(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                });
            },
            enterChampionship: ({ judge, reconnection }) => {
                setLoading(true);
                dispatch({ type: actionType.WILL_BLOCK_INPUT });

                connectionRef.current.connection = Connector.subscribeToChampionship({
                    championshipID,
                    judge,
                    reconnection,
                    observer: {
                        next: (backState) => dispatch({ type: actionType.SYNC_STATE, payload: backState }),
                        error: (e) => dispatch({ type: actionType.ERROR_PHASE, payload: { message: e.message }})
                    }
                });
            },
            deleteParticipant: ({ participantID }) => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });
                setLoading(true);

                Connector.removeParticipantFromChampionship({ championshipID, participantID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            imJudgeAndImReady: () => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });

                Connector.judgeIsReady({ championshipID }).catch(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                });
            },
            restartChampionship: () => {
                Connector.restartChampionship({ championshipID });
            },
            kickJudge: (judgeID) => {
                Connector.removeJudgeFromChampionship({ championshipID, judgeID });
            },
            rerollMovieList: () => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });
                setLoading(true);

                Connector.rerollMovieList({ championshipID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            startMovieChampionship: () => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });
                setLoading(true);

                Connector.startMovieChampionship({ championshipID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            likeParticipant: ({ participantID }) => {
                dispatch({ type: actionType.WILL_BLOCK_INPUT });
                setLoading(true);

                Connector.likeParticipant({ championshipID, participantID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            fetchInviteLink: () => {
                return Connector.generateInvite({ championshipID }).then((linkURI) => Promise.resolve(`${window.location.origin}/back${linkURI}`));
            }
        };
    }, [championshipID, dispatch, setLoading]);

    const selectedState = React.useMemo(() => {
        return {
            participantList: clientState.participants || [],
            errorMessage: clientState.errorMessage,
            hasVoted: clientState.hasVoted,
            allReady: clientState.allReady,
            canInput: clientState.canInput,
            whoVoted: clientState.whoVoted,
            judgeList: clientState.judges,
            roundIndex: clientState.round,
            isOwner: clientState.isOwner,
            isReady: clientState.isReady,
            winners: clientState.winners,
            judgeID: clientState.judgeID,
            context: clientState.context,
            likes: clientState.likes,
            phase: clientState.phase,
            round: getRound(clientState),
            progress: getChampionshipProgress(clientState),
            roundHistory: getRoundHistory(clientState.winners, clientState.rounds),
            scoreboard: getScoreboard(clientState.winners, clientState.votes, clientState.judges, clientState.likes),
            roundName: getRoundName(clientState.participants, clientState.round),
            likeList: getLikeList(clientState.participants, clientState.likes, clientState.judgeID)
        };
    }, [clientState]);

    React.useEffect(() => {
        let timeout;

        if (clientState.willBlockInput) {
            timeout = setTimeout(() => {
                dispatch({ type: actionType.BLOCK_INPUT });
            }, 200);
        } else {
            dispatch({ type: actionType.FREE_INPUT });
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [clientState.willBlockInput]);

    React.useEffect(() => {
        setLoading(true);

        Connector.getChampionshipInfo({ championshipID }).then((info) => {
            if (!info.isAJudge) {
                dispatch({ type: actionType.CHANGE_PHASE, payload: { phase: phases.ENTERING }});

                if (!info.canEnter) {
                    dispatch({ type: actionType.ERROR_PHASE, payload: { message: 'Couldnt enter in championship: is not in preparation phase' }});
                }
            } else {
                actions.enterChampionship({ reconnection: true });
            }

            if (!info.hasChampionship) {
                dispatch({ type: actionType.ERROR_PHASE, payload: { message: 'Couldnt find championship' }});
            }
        }).catch((error) => {
            dispatch({ type: actionType.ERROR_PHASE, payload: { message: 'An error has ocurred fetching championship info: ' + error }});
        }).finally(() => {
            setLoading(false);
        });

        let connection = connectionRef.current.connection;

        return () => {
            if (connection) connection.unsubscribe(); 
        }
    }, [actions, dispatch, championshipID, setLoading]);

    React.useEffect(() => {
        dispatch({ type: actionType.FREE_INPUT });
        setLoading(false);
    }, [clientState.round, clientState.phase, clientState.isOwner, dispatch, setLoading]);

    return [ getState(selectedState, clientState), getActions({ actions, setLoading, Connector, championshipID }) ];
}

export function useClientStateContext() {
    const state = React.useContext(ClientStateContext);
    const actions = React.useContext(ClientActionContext);

    return [ state, actions ];
}

export function Provider(props) {
    const { setLoading } = useLoadingContext();
    const [ state, actions ] = useClientState({ 
        championshipID: props.championshipID,
        setLoading: setLoading,
        getState: props.getState,
        getActions: props.getActions
    });

    return (
        <ClientActionContext.Provider value={actions}>
            <ClientStateContext.Provider value={state}>
                {props.children}
            </ClientStateContext.Provider>
        </ClientActionContext.Provider>
    );
}

Provider.defaultProps = {
    getState: (identity) => identity,
    getActions: (api) => api.actions
};