import React from 'react';
import { Route, useHistory, useParams } from "react-router-dom";
import { Provider as ClientProvider, useClientStateContext, phases } from '../../Core/Client';
import { Winner } from './Containers/Winner';
import { Voting } from './Containers/Voting';
import { Subscription } from '../Client/Containers/Subscription';
import { Preparation } from './Containers/Preparation';
import { Error } from '../Client/Components/Error';
import { Loading } from '../../Components/Loading';
import { RouteAnimation } from '../../Components/RouteAnimation/RouteAnimation';
import { VotingInput } from '../../Components/VotingInput';
import { RoundWinner } from '../../Components/RoundWinner';

const ENTERING = 'entering';
const WINNER = 'winner';
const PREPARATION = 'preparation';
const VOTING = 'voting';
const ERROR = 'error';
const LOADING = 'loading';

function getPhaseRoute(phase) {
    switch (phase) {
        case phases.FINISH_CHAMPIONSHIP:
            return WINNER;
        case phases.START_MATCHUP_VOTE:
        case phases.END_MATCHUP_VOTE:
            return VOTING;
        case phases.PREPARATION:
            return PREPARATION;
        case phases.ENTERING:
            return ENTERING;
        case phases.ERROR:
            return ERROR;
        case phases.LOADING:
            return LOADING;
        default:
            return '';
    }
}

function getChampionshipPath(routePhase) {
    return `/quiz/:championshipID/${routePhase}`;
}

function ClientContainer(props) {
    const history = useHistory();
    const { championshipID } = props;
    const [ state, actions ] = useClientStateContext({ championshipID });
    const phaseRoute = getPhaseRoute(state.phase);

    React.useEffect(() => {
        history.push(`/quiz/${championshipID}/${phaseRoute}`);
    }, [history, phaseRoute, championshipID]);

    return (
        <React.Fragment>
            <Route path={getChampionshipPath(WINNER)}>
                {
                    ({ match }) => (
                        <RouteAnimation match={match}>
                            {
                                phaseRoute === WINNER ? (
                                    <Winner
                                        championshipID={championshipID}
                                    />
                                ) : null
                            }
                        </RouteAnimation>
                    )
                }
            </Route>
            <Route path={getChampionshipPath(VOTING)}>
                {
                    ({ match }) => (
                        <RouteAnimation match={match}>
                            {
                                phaseRoute === VOTING ? (
                                    <Voting
                                        championshipID={championshipID}
                                        VotingInputCmp={VotingInput}
                                        RoundWinnerCmp={RoundWinner}
                                    />
                                ) : null
                            }
                        </RouteAnimation>
                    )
                }
            </Route>
            <Route path={getChampionshipPath(PREPARATION)}>
                {
                    ({ match }) => (
                        <RouteAnimation match={match}>
                            {
                                phaseRoute === PREPARATION ? (
                                    <Preparation
                                        championshipID={championshipID}
                                    />
                                ) : null
                            }
                        </RouteAnimation>
                    )
                }
            </Route>
            <Route path={getChampionshipPath(ENTERING)}>
                {
                    ({ match }) => (
                        <RouteAnimation match={match}>
                            {
                                phaseRoute === ENTERING ? (
                                    <Subscription
                                        championshipID={championshipID}
                                    />
                                ) : null
                            }
                        </RouteAnimation>
                    )
                }
            </Route>
            <Route path={getChampionshipPath(ERROR)}>
                {
                    ({ match }) => (
                        <RouteAnimation match={match}>
                            <Error message={state.errorMessage} />
                        </RouteAnimation>
                    )
                }
            </Route>
            <Route path={getChampionshipPath(LOADING)}>
                {
                    ({ match }) => (
                        <RouteAnimation match={match}>
                            <Loading />
                        </RouteAnimation>
                    )
                }
            </Route>
        </React.Fragment>
    );
}

function getQuestion(state) {
    return state.questions && state.questions[state.round] ? state.questions[state.round].data : { text: '' };
}

function getQuestionText(state) {
    return getQuestion(state).text;
}

function calculatePoints(winners, votes, judgeID) {
    const judgePointMap = new Map(
            Array.prototype.concat.apply([], votes).filter((vote) => {
                return vote.judge.judgeID === judgeID;
            }).map((vote) => {
                return [vote.participant.participantID, true];
            })
        );

    return winners.reduce((sum, winner) => {
        return judgePointMap.has(winner.participant.participantID) ? sum + 1 : sum;
    }, 0);
}

function getScoreboard({ judges, winners, votes }) {
    if (!judges) {
        return [];
    }

    return judges.reduce((scoreboard, judge) => {
        const points = calculatePoints(winners, votes, judge.judgeID);

        return scoreboard.concat({
            id: judge.judgeID,
            name: judge.name,
            points,
            text: `${points} / ${winners.length}`
        });
    }, []).sort((a, b) => a.points > b.points ? -1 : 1);
}

function getRoundResult({ judges, participants, votes, winners, round, judgeID }) {
    if (!votes || !votes[round - 1]) {
        return [];
    }

    const judgeMap = new Map(judges.map((judge) => [judge.judgeID, judge]));
    const participantMap = new Map(participants.map((participant) => [participant.participantID, participant]));

    return votes[round - 1].reduce((acc, item) => {
        return acc.concat({
            judge: judgeMap.get(item.judge.judgeID),
            participant: participantMap.get(item.participant.participantID),
            winner: winners[round - 1].participant.participantID === item.participant.participantID,
            own: judgeID === item.judge.judgeID
        });
    }, []);
}

function getReport({ judges, votes, participants, questions }) {
    if (!votes || !judges || !questions) {
        return [];
    }

    const participantMap = new Map(participants.map((participant) => [participant.participantID, participant.data.text]));

    return {
        judges,
        questions: questions.map((question, index) => {
            if (!votes[index]) return {};

            return {
                question: question.data.text,
                answers: judges.map((judge) => {
                    const judgeVote = votes[index].find((vote) => vote.judge.judgeID === judge.judgeID);

                    if (judgeVote) {
                        return participantMap.get(judgeVote.participant.participantID);
                    }

                    return {};
                })
            }
        })
    }
}

function getOwnerResult(data) {
    return getRoundResult(data).filter((item) => item.judge.judgeID !== data.judgeID);
}

function getOwnResult(data) {
    return getRoundResult(data).find((item) => item.own && item.winner) ? { data: { text: 'Acertou!' } } : { data: { text: 'Errou!' } }
}

function getProgress({ rounds, round }) {
    return (round / (rounds ? rounds.length : 1)) * 100;
}

function getIsQuestionOwner({ round, questions, judgeID }) {
    if (!questions) {
        return false;
    }

    return questions[round] ? questions[round].judgeID === judgeID : false;
}

function getState(selectedState, fullState) {
    const scoreboard = getScoreboard(fullState).slice(fullState.multiple ? 0 : 1);

    return {
        ...selectedState,
        progress: getProgress(fullState),
        question: getQuestionText(fullState),
        result: getOwnerResult(fullState),
        ownResult: getOwnResult(fullState),
        report: getReport(fullState),
        isQuestionOwner: getIsQuestionOwner(fullState),
        multiple: fullState.multiple,
        winner: { data: { text: scoreboard[0] && scoreboard[0].name }},
        scoreboard
    };
}

function getActions({ actions, setLoading, Connector, championshipID }) {
    return {
        ...actions,
        readyQuiz: (questions) => {
            setLoading(true);

            Connector.readyQuiz({ championshipID, questions }).finally(() => {
                setLoading(false);
            });
        }
    };
}

export const Quiz = () => {
    const { championshipID } = useParams();

    return (
        <ClientProvider 
            getState={getState}
            getActions={getActions}
            championshipID={championshipID}
        >
            <ClientContainer championshipID={championshipID} />
        </ClientProvider>
    );
}
