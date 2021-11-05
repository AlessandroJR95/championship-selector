import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { JudgeList } from '../../../Components/JudgeList';
import { ParticipantList } from '../../../Components/ParticipantList';
import { ParticipantInput } from '../../../Components/ParticipantInput';

function PreparationView(props) {
    const { ParticipantListCmp, ParticipantInputCmp, judgeID, likes, isOwner } = props;

    const readyCheck = React.useCallback(({ ready }) => {
        return ready;
    }, []);

    const isLiked = React.useCallback(({ participantID }) => {
        return likes.some((like) => like.judge.judgeID === judgeID && like.participant.participantID === participantID);
    }, [judgeID, likes]);

    return (
        <Grid container spacing={0}>
            <Grid item xs={12}>
                <Box style={{ padding: "20px 20px 0 20px" }}>
                    <JudgeList 
                        judgeList={props.judgeList}
                        readyCheck={readyCheck}
                        judgeID={props.judgeID}
                        onKick={isOwner ? props.onJudgeKick : null}
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ margin: 20 }}>
                    <Paper style={{ height: 400, maxHeight: 400, overflow: 'auto' }}>
                        <ParticipantListCmp 
                            participantList={props.participantList}
                            canDelete={isOwner}
                            disableDelete={props.disableListDelete}
                            onDelete={props.onParticipantDelete}
                            onLike={props.onParticipantLike}
                            isLiked={isLiked}
                        />
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ textAlign: 'center', margin: 10 }}>
                    <ParticipantInputCmp
                        addParticipant={props.addParticipant}
                        canAddParticipant={props.canAddParticipant}
                    />
                </Box>
                {props.children}
            </Grid>
            <Grid item xs={12}>
                <Box style={{ margin: 10 }}>
                    {
                        isOwner ? (
                            <div style={{ textAlign: 'center' }}>
                                <Button variant="outlined" color="secondary" onClick={props.startChampionship} disabled={!props.allReady || !props.canStartChampionship}>
                                    Começar a votação!
                                </Button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <Button variant="outlined" color="secondary" onClick={props.onReadyClick} disabled={props.isReady}>
                                    Estou pronto!
                                </Button>
                            </div>
                        )
                    }
                </Box>
            </Grid>
        </Grid>
    );
}

PreparationView.defaultProps = {
    ParticipantListCmp: ParticipantList,
    ParticipantInputCmp: ParticipantInput
}

export const Preparation = React.memo(PreparationView);