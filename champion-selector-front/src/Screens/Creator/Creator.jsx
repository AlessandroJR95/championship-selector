import React from 'react';
import Button from '@material-ui/core/Button';
import {
    useHistory
  } from "react-router-dom";
import Connector from '../../Core/connector';
import { useLoadingContext } from '../../Core/Loading'
import { Center } from '../../Components/Center';

export const Creator = () => {
    const { loading, setLoading } = useLoadingContext();
    const history = useHistory();

    const createChampionship = React.useCallback(() => {
        setLoading(true);

        Connector.createChampionship().then((oid) => {
            history.push(`/${oid}`)
        }).finally(() => {
            setLoading(false);
        });
    }, [setLoading, history]);

    return (
        <Center>
            <Button variant="outlined" color="secondary" onClick={createChampionship} disabled={loading}>{'Criar um torneio!'}</Button>
        </Center>
    );
}