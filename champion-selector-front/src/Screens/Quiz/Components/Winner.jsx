import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { RoundWinner } from '../../../Components/RoundWinner';
import { Scoreboard } from '../../../Components/Scoreboard';
import { Fade } from '../../../Components/Fade/Fade';
import { Center } from '../../../Components/Center';
import { QuizReport } from '../../../Components/QuizReport';

function WinnerView(props) {
    const [ podium, setPodium ] = React.useState(false);

    const showPodium = React.useCallback(() => {
        setPodium(true);
    }, []);

    return (
        <Center>
            <Grid container>
                <Grid item xs={12}>
                    <Box style={{padding: 10}}>
                        <RoundWinner
                            preparationText={'O ganhador do quiz é'}
                            roundWinner={props.winner}
                            roundWinnerBadges={[]}
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
                        <Box style={{padding: 10}}>
                            <Scoreboard
                                show={podium}
                                scoreboard={props.scoreboard}
                            />
                        </Box>
                    </Fade>
                </Grid>
                <Grid item xs={12} style={{marginTop: 50}}>
                    <Fade show={podium}>
                        <Box style={{padding: 10}}>
                            <QuizReport
                                report={props.report}
                            />
                        </Box>
                    </Fade>
                </Grid>
            </Grid>
        </Center>
    );
}

export const Winner = React.memo(WinnerView);