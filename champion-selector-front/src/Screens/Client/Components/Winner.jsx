import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { RoundWinner } from '../../../Components/RoundWinner';
import { WinnerPodium } from '../../../Components/WinnerPodium';
import { Scoreboard } from '../../../Components/Scoreboard';
import { Fade } from '../../../Components/Fade/Fade';
import { Center } from '../../../Components/Center';

function WinnerView(props) {
    const [ podium, setPodium ] = React.useState(false);
    const { RoundWinnerCmp } = props;

    const showPodium = React.useCallback(() => {
        setPodium(true);
    }, []);

    return (
        <Center>
            <Grid container>
                <Grid item xs={12}>
                    <Box style={{padding: 10}}>
                        <RoundWinnerCmp
                            preparationText={'O ganhador do campeonato é'}
                            roundWinner={props.winner.participant}
                            roundWinnerBadges={props.winner.badges}
                            onEntered={showPodium}
                        >
                            { props.isOwner && (
                                <Button variant="outlined" color="secondary" onClick={props.onRestart}>
                                    {'Reiniciar sala'}
                                </Button>
                            )}
                        </RoundWinnerCmp>
                    </Box>
                </Grid>
                <Grid item xs={12} style={{marginTop: 50}}>
                    <Fade show={podium}>
                        <Box style={{padding: 10}}>
                            <Scoreboard
                                show={podium}
                                scoreboard={props.scoreboard}
                            />
                        </Box>
                        <Box style={{padding: 10}}>
                            <WinnerPodium 
                                winners={props.winners}
                            />
                        </Box>
                    </Fade>
                </Grid>
            </Grid>
        </Center>
    );
}

WinnerView.defaultProps = {
    RoundWinnerCmp: RoundWinner
};

export const Winner = React.memo(WinnerView);