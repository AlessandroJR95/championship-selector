import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { IconSelectorIcon } from './IconSelector';

export function JudgeList(props) {
    const [ currentJudge, setCurrentJudge ] = React.useState({ target: null, id: null });
    const { onKick, readyCheck, judgeID } = props;

    const handleOpen = React.useCallback((oid) => {
        return (evt) => {
            setCurrentJudge({ target: evt.target, id: oid });
        }
    }, [setCurrentJudge]);

    const handleClose = React.useCallback(() => {
        setCurrentJudge({ target: null, id: null });
    }, [setCurrentJudge]);

    const handleKick = React.useCallback(() => {
        handleClose();
        onKick(currentJudge.id);
    }, [onKick, currentJudge, handleClose]);

    return (
        <React.Fragment>
            <Grid container spacing={0}>
                {
                    props.judgeList.map((item, index, all) => (
                        <React.Fragment key={item.id}>
                            <Grid item xs={4}>
                                <Box style={{ display: 'flex' }} onClick={item.id === judgeID ? null : handleOpen(item.id)}>
                                    <Box style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', margin: 5 }}>
                                        <IconSelectorIcon fontSize={'small'} name={item.icon} color={item.id === judgeID ? 'secondary' : 'primary'} />
                                    </Box>
                                    <Box>
                                        <Typography variant={'subtitle1'} color={readyCheck(item)  ? 'textPrimary' : 'textSecondary'}>
                                                {item.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </React.Fragment>
                    ))
                }
            </Grid>
            <Menu
                id={"judgeOptionsMenu"}
                anchorEl={currentJudge.target}
                keepMounted
                open={Boolean(currentJudge.target)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleKick}>Kick</MenuItem>
            </Menu>
        </React.Fragment>
    );
}