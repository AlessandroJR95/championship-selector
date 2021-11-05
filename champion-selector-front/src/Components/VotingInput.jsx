import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

function VoteOptions({ index, round, onVote, disabled }) {

    const voteProxy = React.useCallback(() => {
        onVote(round);
    }, [round, onVote]);

    return (
        <Grid item xs={12} style={{ margin: 10 }}>
            <Button onClick={voteProxy} variant="outlined" color={index % 2 ? 'primary' : 'secondary'} disabled={disabled}>
                {round.data.text}
            </Button>
        </Grid>
    );
}

export function VotingInput(props) {
    const { round, addVote, disabled } = props;

    return round ? (
        <Grid container>
            {
                round.map((actual, index) => (
                    <VoteOptions
                        index={index}
                        round={actual}
                        onVote={addVote}
                        disabled={disabled}
                    />
                ))
            }
        </Grid>
    ) : null;
}