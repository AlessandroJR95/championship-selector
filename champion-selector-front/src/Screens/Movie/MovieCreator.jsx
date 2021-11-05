import React from 'react';
import Button from '@material-ui/core/Button';
import {
    useHistory
  } from "react-router-dom";
import Connector from '../../Core/connector';
import { useLoadingContext } from '../../Core/Loading'
import { Center } from '../../Components/Center';
import { FavoriteMovies } from './Components/FavoriteMovies';
import Grid from '@material-ui/core/Grid';

export const MovieCreator = () => {
    const { loading, setLoading } = useLoadingContext();
    const history = useHistory();

    const createChampionship = React.useCallback(() => {
        setLoading(true);

        Connector.createChampionship({
            type: 'movie',
        }).then((oid) => {
            history.push(`/movie/${oid}`)
        }).finally(() => {
            setLoading(false);
        });
    }, [setLoading, history]);

    return (
        <Center>
            <Grid item xs={12} style={{ marginTop: 100, marginBottom: 100 }}>
                <Button variant="outlined" color="secondary" onClick={createChampionship} disabled={loading}>{'Criar um torneio de filmes!'}</Button>
            </Grid>
            <Grid item xs={12}>
                <FavoriteMovies />
            </Grid>
        </Center>
    );
}