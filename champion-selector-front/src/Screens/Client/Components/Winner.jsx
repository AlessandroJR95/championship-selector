import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { RoundWinner } from '../../../Components/RoundWinner';
import { WinnerPodium } from '../../../Components/WinnerPodium';
import { Fade } from '../../../Components/Fade/Fade';

function WinnerView(props) {
    const [ podium, setPodium ] = React.useState(false);

    const showPodium = React.useCallback(() => {
        setPodium(true);
    }, []);

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <Box style={{padding: 10}}>
                        <RoundWinner
                            preparationText={'O ganhador do campeonato é'}
                            roundWinner={props.winner.participant.text}
                            roundWinnerBadges={props.winner.badges}
                            onEntered={showPodium}
                        >
                            { props.isOwner && (
                                <Button variant="outlined" color="secondary" onClick={props.onRestart}>
                                    {'Reiniciar sala'}
                                </Button>
                            )}
                        </RoundWinner>
                    </Box>
                </Grid>
                <Grid item xs={12} style={{marginTop: 50}}>
                    <Fade show={podium}>
                        <WinnerPodium 
                            winners={props.winners}
                        />
                    </Fade>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export const Winner = React.memo(WinnerView);