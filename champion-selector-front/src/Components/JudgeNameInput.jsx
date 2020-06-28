import React from 'react';
import Box from "@material-ui/core/Box";
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import { IconSelector, IconSelectorIcon } from './IconSelector';

const IconsToSelect = [
    { name: 'AccountCircle' },
    { name: 'Adb' },
    { name: 'Accessibility' },
    { name: 'Face' },
    { name: 'WbSunny' },
    { name: 'Apple' },
    { name: 'Android' },
    { name: 'Audiotrack' },
    { name: 'Brightness3' },
    { name: 'ChildCare' },
    { name: 'GitHub' },
    { name: 'InsertEmoticon' },
    { name: 'LocalFlorist' },
    { name: 'MoodBad' },
    { name: 'Pets' },
    { name: 'Person' }
];

export function JudgeNameInput(props) {
    const [ modal, setModal ] = React.useState(false);
    const { onSubmit, onChangeName, name, icon, onChangeIcon } = props;

    const onClick = React.useCallback(() => {
        onSubmit({ name, icon });
    }, [onSubmit, name, icon]);

    const onChangeProxy = React.useCallback((e) => {
        onChangeName(e.target.value);
    }, [onChangeName]);

    const openModal = React.useCallback(() => {
        setModal(true);
    }, []);

    const closeModal = React.useCallback(() => {
        setModal(false);
    }, []);

    return (
        <React.Fragment>
            <Modal
                open={modal}
                onClose={closeModal}
            >
                <Grid container style={{height: '100%'}} justify={'center'} alignItems={'center'} direction={'row'}>
                    <Grid item xs={9}>
                        <Paper style={{padding: 5}}>
                            <Box>
                                <IconSelector
                                    icons={IconsToSelect}
                                    value={icon}
                                    onChange={onChangeIcon}
                                />
                            </Box>
                            <Box style={{marginTop: 10}}>
                                <Button
                                    color="primary"
                                    onClick={closeModal}
                                    fullWidth
                                    variant="contained"
                                >
                                    Ok
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Modal>
            <Box>
                <TextField
                    value={name}
                    onChange={onChangeProxy}
                    placeholder={'Digite seu nome'}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment>
                                <Box style={{ padding: 5 }}>
                                    <IconButton
                                        color="secondary"
                                        onClick={openModal}
                                    >
                                        <IconSelectorIcon fontSize={'large'} name={icon} />
                                    </IconButton>
                                </Box>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>
            <Box style={{ padding: 10 }}>
                <Button
                    color="primary"
                    onClick={onClick}
                    variant="outlined"
                    fullWidth
                    disabled={!props.canEnter}
                >
                    Entrar
                </Button>
            </Box>
        </React.Fragment>
    );
}