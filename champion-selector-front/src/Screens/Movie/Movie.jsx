import React from 'react';
import { Route, useHistory, useParams } from "react-router-dom";
import { Provider as ClientProvider, useClientStateContext, phases } from '../../Core/Client';
import { Winner } from '../Client/Containers/Winner';
import { Voting } from '../Client/Containers/Voting';
import { Subscription } from '../Client/Containers/Subscription';
import { Preparation } from '../Client/Containers/Preparation';
import { Error } from '../Client/Components/Error';
import { Loading } from '../../Components/Loading';
import { MovieVotingInput } from './Components/MovieVotingInput';
import { MovieRoundWinner } from './Components/MovieRoundWinner';
import { MovieRerollButton } from './Components/MovieRerollButton';
import { MovieParticipantList } from './Components/MovieParticipantList';
import { GenreMovieRoundWinneFactory } from './Components/GenreMovieRoundWinner';
import { RouteAnimation } from '../../Components/RouteAnimation/RouteAnimation';
import { VotingInput } from '../../Components/VotingInput';
import { RoundWinner } from '../../Components/RoundWinner';
import { ParticipantList } from '../../Components/ParticipantList';

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
    return `/movie/:championshipID/${routePhase}`;
}

function ClientContainer(props) {
    const history = useHistory();
    const { championshipID } = props;
    const [ state, actions ] = useClientStateContext({ championshipID });
    const phaseRoute = getPhaseRoute(state.phase);

    const GenreRoundWinner = React.useMemo(() => GenreMovieRoundWinneFactory(championshipID), [championshipID]);

    React.useEffect(() => {
        history.push(`/movie/${championshipID}/${phaseRoute}`);
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
                                        RoundWinnerCmp={state.context === 'GENRE' ? GenreRoundWinner : MovieRoundWinner}
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
                                        VotingInputCmp={state.context === 'MOVIE' ? MovieVotingInput : VotingInput}
                                        RoundWinnerCmp={state.context === 'MOVIE' ? MovieRoundWinner : RoundWinner}
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
                                        ParticipantInputCmp={() => null}
                                        ParticipantListCmp={state.context === 'MOVIE' ? MovieParticipantList : ParticipantList}
                                    >
                                        {state.context === 'MOVIE' && state.isOwner && <MovieRerollButton onClick={actions.rerollMovieList} disabled={!state.canInput} />}
                                    </Preparation>
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

export const Movie = () => {
    const { championshipID } = useParams();

    return (
        <ClientProvider championshipID={championshipID}>
            <ClientContainer championshipID={championshipID} />
        </ClientProvider>
    );
}
