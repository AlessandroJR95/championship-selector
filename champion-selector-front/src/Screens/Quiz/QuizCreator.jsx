import React from 'react';
import Button from '@material-ui/core/Button';
import {
    useHistory
  } from "react-router-dom";
import Connector from '../../Core/connector';
import { useLoadingContext } from '../../Core/Loading'
import { Center } from '../../Components/Center';
import Grid from '@material-ui/core/Grid';

export const QuizCreator = () => {
    const { loading, setLoading } = useLoadingContext();
    const history = useHistory();

    const createQuiz = React.useCallback((multiple) => {
        setLoading(true);

        Connector.createQuiz({
            type: 'qzz:qzz',
            multiple
        }).then((oid) => {
            history.push(`/quiz/${oid}`)
        }).finally(() => {
            setLoading(false);
        });
    }, [setLoading, history]);

    const createDefaultQuiz =  React.useCallback(() => {
        createQuiz(false);
    }, [createQuiz]);

    const createMultQuiz =  React.useCallback(() => {
        createQuiz(true);
    }, [createQuiz]);

    return (
        <Center>
            <Grid item xs={12} style={{ marginTop: 100, marginBottom: 100 }}>
                <Button variant="outlined" color="secondary" onClick={createDefaultQuiz} disabled={loading}>{'Criar um quiz!'}</Button>
            </Grid>
            <Grid item xs={12} style={{ marginTop: 100, marginBottom: 100 }}>
                <Button variant="outlined" color="secondary" onClick={createMultQuiz} disabled={loading}>{'Criar um mult-quiz!'}</Button>
            </Grid>
        </Center>
    );
}