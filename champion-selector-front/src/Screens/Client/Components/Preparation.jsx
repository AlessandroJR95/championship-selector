import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { JudgeList } from '../../../Components/JudgeList';
import { ParticipantList } from '../../../Components/ParticipantList';
import { ParticipantInput } from '../../../Components/ParticipantInput';

function PreparationView(props) {
    const readyCheck = React.useCallback(({ isReady }) => {
        return isReady;
    }, []);

    return (
        <Grid container spacing={0}>
            <Grid item xs={12}>
                <Box style={{ padding: "20px 20px 0 20px" }}>
                    <JudgeList 
                        judgeList={props.judgeList}
                        readyCheck={readyCheck}
                        judgeID={props.judgeID}
                        onKick={props.onJudgeKick}
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ margin: 20 }}>
                    <Paper style={{ height: 200, maxHeight: 250, overflow: 'auto' }}>
                        <ParticipantList 
                            participantList={props.participantList}
                            canDelete={props.isOwner}
                            disableDelete={props.disableListDelete}
                            onDelete={props.onParticipantDelete}
                        />
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ textAlign: 'center', margin: 10 }}>
                    <ParticipantInput 
                        addParticipant={props.addParticipant}
                        canAddParticipant={props.canAddParticipant}
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ margin: 10 }}>
                    {
                        props.isOwner ? (
                            <div style={{ textAlign: 'center' }}>
                                <Button variant="outlined" color="secondary" onClick={props.startChampionship} disabled={!props.allReady}>
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

export const Preparation = React.memo(PreparationView);