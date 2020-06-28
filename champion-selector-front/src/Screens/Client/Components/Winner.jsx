import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { RoundWinner } from '../../../Components/RoundWinner';

function WinnerView(props) {
    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <Box style={{padding: 10}}>
                        <RoundWinner
                            preparationText={'O ganhador do campeonato é'}
                            roundWinner={props.winner.participant.text}
                            roundWinnerBadges={props.winner.badges}
                        >
                            { props.isOwner && (
                                <Button variant="outlined" color="secondary" onClick={props.onRestart}>
                                    {'Reiniciar sala'}
                                </Button>
                            )}
                        </RoundWinner>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export const Winner = React.memo(WinnerView);