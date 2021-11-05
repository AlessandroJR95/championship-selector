import React from 'react';
import { Route, useHistory, useParams } from "react-router-dom";
import { Provider as ClientProvider, useClientStateContext, phases } from '../../Core/Client';
import { Winner } from './Containers/Winner';
import { Voting } from './Containers/Voting';
import { Preparation } from './Containers/Preparation';
import { Subscription } from './Containers/Subscription';
import { Error } from './Components/Error';
import { RouteAnimation } from '../../Components/RouteAnimation/RouteAnimation';

const ENTERING = 'entering';
const WINNER = 'winner';
const PREPARATION = 'preparation';
const VOTING = 'voting';
const ERROR = 'error';

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
        default:
            return '';
    }
}

function getChampionshipPath(routePhase) {
    return `/:championshipID/${routePhase}`;
}

function ClientContainer(props) {
    const history = useHistory();
    const { championshipID } = props;
    const [ state ] = useClientStateContext({ championshipID });
    const phaseRoute = getPhaseRoute(state.phase);

    React.useEffect(() => {
        history.push(`/${championshipID}/${phaseRoute}`);
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
        </React.Fragment>
    );
}

export const Client = () => {
    const { championshipID } = useParams();

    return (
        <ClientProvider championshipID={championshipID}>
            <ClientContainer championshipID={championshipID} />
        </ClientProvider>
    );
}
