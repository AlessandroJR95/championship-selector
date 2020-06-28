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
}

const actionType = {
    CHANGE_PHASE: 'CHANGE_PHASE',
    ERROR_PHASE: 'ERROR_PHASE',
    BLOCK_INPUT: 'BLOCK_INPUT',
    SYNC_STATE: 'SYNC_STATE',
    FREE_INPUT: 'FREE_INPUT',
};

const clientReducer = (state, action) => {
    switch (action.type) {
        case actionType.SYNC_STATE:
            console.log(action.payload);
            return Object.assign({}, state, action.payload);
        case actionType.CHANGE_PHASE:
            return Object.assign({}, state, { phase: action.payload.phase });
        case actionType.BLOCK_INPUT:
            return Object.assign({}, state, { canInput: false });
        case actionType.FREE_INPUT:
            return Object.assign({}, state, { canInput: true });
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
    if (!winners || !rounds) {
        return [];
    }

    return winners.slice(0, winners.length - 1).map((winner, index) => {
        const loser = rounds[index].find((participant) => participant.participantID !== winner.participant.participantID);

        return {
            round: index + 1,
            winner: winner.participant.text,
            loser: loser.text
        }
    });
}

function getRound(clientState) {
    return clientState.rounds ? clientState.rounds[clientState.round] : null;
}

function getChampionshipProgress(clientState) {
    return clientState.participants ? (clientState.round / (clientState.participants.length - 2)) * 100 : 0;
}

function useClientState(props) {
    const connectionRef = React.useRef({ connection: null });
    const [ clientState, dispatch ] = React.useReducer(clientReducer, clientInitialState);

    const { championshipID, setLoading } = props;

    const actions = React.useMemo(() => {
        return {
            startChampionship: () => {
                dispatch({ type: actionType.BLOCK_INPUT });
                setLoading(true);

                Connector.startChampionship({ championshipID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            addParticipant: (participantName) => {
                dispatch({ type: actionType.BLOCK_INPUT });
                setLoading(true);

                Connector.addParticipantInChampionship({ championshipID, participantName }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            addVote: (participant) => {
                dispatch({ type: actionType.BLOCK_INPUT });

                Connector.voteInParticipant({ championshipID, participant }).catch(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                });
            },
            enterChampionship: ({ judge, reconnection }) => {
                setLoading(true);
                dispatch({ type: actionType.BLOCK_INPUT });

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
                dispatch({ type: actionType.BLOCK_INPUT });
                setLoading(true);

                Connector.removeParticipantFromChampionship({ championshipID, participantID }).finally(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                    setLoading(false);
                });
            },
            imJudgeAndImReady: () => {
                dispatch({ type: actionType.BLOCK_INPUT });

                Connector.judgeIsReady({ championshipID }).catch(() => {
                    dispatch({ type: actionType.FREE_INPUT });
                });
            },
            restartChampionship: () => {
                Connector.restartChampionship({ championshipID });
            },
            kickJudge: (judgeID) => {
                Connector.removeJudgeFromChampionship({ championshipID, judgeID });
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
            phase: clientState.phase,
            round: getRound(clientState),
            progress: getChampionshipProgress(clientState),
            roundHistory: getRoundHistory(clientState.winners, clientState.rounds)
        };
    }, [clientState]);

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
    }, [clientState.phase, dispatch, setLoading]);

    return [ selectedState, actions ];
}

export function useClientStateContext() {
    const state = React.useContext(ClientStateContext);
    const actions = React.useContext(ClientActionContext);

    return [ state, actions ];
}

export function Provider(props) {
    const { setLoading } = useLoadingContext();
    const [ state, actions ] = useClientState({ championshipID: props.championshipID, setLoading: setLoading });

    return (
        <ClientActionContext.Provider value={actions}>
            <ClientStateContext.Provider value={state}>
                {props.children}
            </ClientStateContext.Provider>
        </ClientActionContext.Provider>
    );
}