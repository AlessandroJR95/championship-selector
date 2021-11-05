import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { RoundWinner } from '../../../Components/RoundWinner';
import { VotingInput } from '../../../Components/VotingInput';
import { JudgeList } from '../../../Components/JudgeList';
import { WinnerHistory } from '../../../Components/WinnerHistory';
import { Center } from '../../../Components/Center';
import { SuperInvite } from '../../../Components/SuperInvite';
import { LikeList } from '../../../Components/LikeList';
import { PlayerScore } from '../../../Components/PlayerScore';

function VotingView(props) {
    const winnerText = props.winner && props.winner.participant && props.winner.participant.data && props.winner.participant.data.text + props.roundIndex;
    const { whoVoted, judgeID, roundHistory, VotingInputCmp, RoundWinnerCmp, scoreboard, onJudgeKick, isOwner, likeList } = props;
    const [ lastWinner, setLastWinner ] = React.useState(winnerText);
    const [ isShowingWinner, setIsShowingWinner ] = React.useState(Boolean(winnerText));

    const onTransitionEnd = React.useCallback(() => {
        setLastWinner(winnerText);
        setIsShowingWinner(false);
    }, [setLastWinner, winnerText]);

    React.useEffect(() => {
        setIsShowingWinner(true);
    }, [winnerText]);

    const readyCheck = React.useCallback(({ judgeID }) => {
        return whoVoted.indexOf(judgeID) !== -1;
    }, [whoVoted]);

    return (
        <Center>
            <Grid item xs={12} style={{ padding: 20, textAlign: 'center', minHeight: 250 }}>
                {
                    lastWinner !== winnerText ? (
                        <RoundWinnerCmp 
                            preparationText={'O ganhador do round é'}
                            roundWinner={props.winner.participant}
                            roundWinnerBadges={props.winner.badges}
                            onTransitionEnd={onTransitionEnd}
                            fadeOut
                        />
                    ) : (
                        <Box>
                            {
                                props.roundName ? (
                                    <Typography variant="h3" component="h3" color={'secondary'}>
                                        {props.roundName}
                                    </Typography>
                                ) : null
                            }
                            <VotingInputCmp
                                disabled={!props.canVote}
                                round={props.round}
                                addVote={props.addVote}
                            />
                        </Box>
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
                    onKick={isOwner ? onJudgeKick : null}
                />
            </Grid>
            <Grid item xs={12} style={{ marginTop: 50 }}>
                { 
                    isOwner && (
                        <SuperInvite fetchInviteLink={props.fetchInviteLink} />
                    )
                }
            </Grid>
            <Grid item xs={12} style={{ padding: 10 }}>
                <PlayerScore scoreboard={scoreboard} judgeID={judgeID} shouldUpdateScore={!isShowingWinner} />
            </Grid>
            <Grid item xs={12} style={{ padding: 10 }}>
                <LikeList likeList={likeList} />
            </Grid>
            <Grid item xs={12} style={{ padding: 10 }}>
                <WinnerHistory 
                    roundHistory={roundHistory}
                    shouldUpdateHistory={!isShowingWinner}
                />
            </Grid>
        </Center>
    );
}

VotingView.defaultProps = {
    VotingInputCmp: VotingInput,
    RoundWinnerCmp: RoundWinner
};

export const Voting = React.memo(VotingView);