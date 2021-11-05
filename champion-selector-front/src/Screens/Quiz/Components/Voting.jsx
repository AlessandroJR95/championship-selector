import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { RoundWinner } from '../../../Components/RoundWinner';
import { VotingInput } from '../../../Components/VotingInput';
import { JudgeList } from '../../../Components/JudgeList';
import { Center } from '../../../Components/Center';
import { PartialResult } from '../../../Components/PartialResult';

function VotingView(props) {
    const winnerText = props.winner && props.winner.participant && props.winner.participant.data && props.winner.participant.data.text + props.roundIndex;
    const { whoVoted, judgeID, question, onJudgeKick, isOwner, isQuestionOwner } = props;
    const [ lastWinner, setLastWinner ] = React.useState(winnerText);
    const [ lastOwner, setLastOwner ] = React.useState(isQuestionOwner);

    const onTransitionEnd = React.useCallback(() => {
        setLastWinner(winnerText);
        setLastOwner(isQuestionOwner);
    }, [setLastWinner, winnerText, isQuestionOwner]);

    const readyCheck = React.useCallback(({ judgeID }) => {
        return whoVoted.indexOf(judgeID) !== -1;
    }, [whoVoted]);

    return (
        <Center>
            <Grid item xs={12} style={{ padding: 20, textAlign: 'center', minHeight: 250 }}>
                {
                    lastWinner !== winnerText ? (
                        lastOwner ? (
                            <PartialResult
                                result={props.result}
                                onTransitionEnd={onTransitionEnd}
                                fadeOut
                            />
                        ) : (
                            <RoundWinner
                                preparationText={'Você...'}
                                roundWinner={props.ownResult}
                                roundWinnerBadges={[]}
                                onTransitionEnd={onTransitionEnd}
                                fadeOut
                            />
                        )
                    ) : (
                        <Box>
                            <Typography variant={'h5'} color={'primary'}>
                                {question}
                            </Typography>
                            <VotingInput
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
        </Center>
    );
}

export const Voting = React.memo(VotingView);