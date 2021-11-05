import React from 'react';
import {
    Switch,
    Route,
    useLocation
  } from "react-router-dom";
import { Client } from './Client/Client';
import { Creator } from './Creator/Creator';
import { Movie } from './Movie/Movie';
import { MovieCreator } from './Movie/MovieCreator';
import { Quiz } from './Quiz/Quiz';
import { QuizCreator } from './Quiz/QuizCreator';
import { Loading } from '../Components/Loading';
import { useLoadingContext } from '../Core/Loading'
import Grid from '@material-ui/core/Grid';

export const Home = () => {
    const { loading } = useLoadingContext();
    const location = useLocation();

    return (
        <Grid
            container
            spacing={0}
        >
            <Grid item xs={12} style={{ textAlign: 'center', position: 'relative' }}>
                <Switch location={location}>
                    <Route path={"/quiz/:championshipID"}>
                        <Quiz />
                    </Route>
                    <Route path={"/quiz"}>
                        <QuizCreator />
                    </Route>
                    <Route path={"/movie/:championshipID"}>
                        <Movie />
                    </Route>
                    <Route path={"/movie"}>
                        <MovieCreator />
                    </Route>
                    <Route path={"/:championshipID"}>
                        <Client />
                    </Route>
                    <Route exact path={"/"}>
                        <Creator />
                    </Route>
                </Switch>
            </Grid>
            <Grid item xs={12} style={{ alignSelf: 'flex-end' }}>
                <Loading show={loading} />
            </Grid>
        </Grid>
    );
}