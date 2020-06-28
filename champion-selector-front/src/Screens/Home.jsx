import React from 'react';
import {
    Switch,
    Route,
    useLocation
  } from "react-router-dom";
import { Client } from './Client/Client';
import { Creator } from './Creator/Creator';
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
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
        >
            <Grid item xs={12} style={{ textAlign: 'center', position: 'relative' }}>
                <Switch location={location}>
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