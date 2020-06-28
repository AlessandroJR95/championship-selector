import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

export function VotingInput(props) {
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
                <Button onClick={voteInFirst} variant="outlined" color="primary" disabled={disabled}>
                    {round[0].text}
                </Button>
            </Grid>
            <Grid item xs={12} style={{ margin: 10 }}>
                <Button onClick={voteInSecond} variant="outlined" color="secondary" disabled={disabled}>
                    {round[1].text}
                </Button>
            </Grid>
        </Grid>
    ) : null;
}