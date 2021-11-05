import React from 'react';
import Button from '@material-ui/core/Button';
import { RoundWinner } from '../../../Components/RoundWinner';
import { useClientStateContext } from '../../../Core/Client';

export function GenreMovieRoundWinneFactory(championshipID) {
    return function GenreMovieRoundWinner(props) {
        const [ state, actions ] = useClientStateContext({ championshipID: championshipID });
    
        return (
            <RoundWinner
                {...props}
            >
                { state.isOwner && (
                    <Button variant="outlined" color="secondary" onClick={actions.startMovieChampionship}>
                        {'Ir para os filmes'}
                    </Button>
                )}
            </RoundWinner>
        );
    }
}