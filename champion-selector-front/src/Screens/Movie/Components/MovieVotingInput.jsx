import React from 'react';
import Grid from '@material-ui/core/Grid';
import { MovieCard } from './MovieCard';

export function MovieVotingInput(props) {
    const { round, addVote, disabled } = props;

    const voteInFirst = React.useCallback(() => {
        addVote(round[0]);
    }, [round, addVote]);

    const voteInSecond = React.useCallback(() => {
        addVote(round[1]);
    }, [round, addVote]);

    return round ? (
        <Grid container>
            <Grid item xs={12} style={{ margin: 10 }}>
                <MovieCard 
                    onClick={voteInFirst} 
                    variant="outlined" 
                    color="primary" 
                    disabled={disabled}
                    thumb={round[0].data.thumb}
                    title={round[0].data.title}
                    description={round[0].data.description}
                    score={round[0].data.score}
                    year={round[0].data.year}
                    trailer={round[0].data.trailer}
                    canFavorite
                />
            </Grid>
            <Grid item xs={12} style={{ margin: 10 }}>
                <MovieCard 
                    onClick={voteInSecond}
                    variant="outlined"
                    color="secondary"
                    disabled={disabled}
                    thumb={round[1].data.thumb}
                    title={round[1].data.title}
                    description={round[1].data.description}
                    score={round[1].data.score}
                    year={round[1].data.year}
                    trailer={round[1].data.trailer}
                    canFavorite
                />
            </Grid>
        </Grid>
    ) : null;
}