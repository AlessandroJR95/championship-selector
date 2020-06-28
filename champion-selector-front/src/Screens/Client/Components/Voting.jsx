import React from 'react';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { RoundWinner } from '../../../Components/RoundWinner';
import { VotingInput } from '../../../Components/VotingInput';
import { JudgeList } from '../../../Components/JudgeList';
import { WinnerHistory } from '../../../Components/WinnerHistory';
import { Fade } from '../../../Components/Fade/Fade';

function VotingView(props) {
    const winnerText = props.winner && props.winner.participant && props.winner.participant.text;
    const { whoVoted, judgeID, roundHistory } = props;
    const [ show, setShow ] = React.useState(Boolean(winnerText));
    const [ history, setHistory ] = React.useState(false);

    const onTransitionEnd = React.useCallback(() => {
        setShow(false);
        setHistory(true);
    }, [setShow, setHistory]);

    const readyCheck = React.useCallback(({ id }) => {
        return whoVoted.indexOf(id) !== -1;
    }, [whoVoted]);

    React.useEffect(() => {
        setShow(Boolean(winnerText));
    }, [winnerText, setShow]);

    return (
        <Grid container>
            <Grid item xs={12} style={{ padding: 20, textAlign: 'center', height: 250 }}>
                {
                    show ? (
                        <RoundWinner 
                            preparationText={'O ganhador do round é'}
                            roundWinner={props.winner.participant.text}
                            roundWinnerBadges={props.winner.badges}
                            onTransitionEnd={onTransitionEnd}
                            fadeOut
                        />
                    ) : (
                        <VotingInput
                            disabled={!props.canVote}
                            round={props.round}
                            addVote={props.addVote}
                        />
                    )
                }
            </Grid>
            <Grid item xs={12} style={{ margin: "0 0 10px 0" }}>
                <LinearProgress variant={'determinate'} value={props.progress} />
            </Grid>
            <Grid item xs={12}>
                <JudgeList 
                    judgeList={props.judgeList}
                    readyCheck={readyCheck}
                    judgeID={judgeID}
                />
            </Grid>
            <Grid item xs={12} style={{marginTop: 50}}>
                <Fade show={history}>
                    <WinnerHistory 
                        roundHistory={roundHistory}
                    />
                </Fade>
            </Grid>
        </Grid>
    );
}

export const Voting = React.memo(VotingView);