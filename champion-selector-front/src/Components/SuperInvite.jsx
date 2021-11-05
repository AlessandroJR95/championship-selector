import React from 'react';
import Box from "@material-ui/core/Box";
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Loading } from './Loading';

export function SuperInvite(props) {
    const [ modal, setModal ] = React.useState(false);
    const [ loading, setLoading ] = React.useState(true);
    const [ inviteLink, setInviteLink ] = React.useState(true);
    const { fetchInviteLink } = props;

    const openModal = React.useCallback(() => {
        setModal(true);
        setLoading(true);

        fetchInviteLink().then((link) => {
            setInviteLink(link);
            setLoading(false);
        });
    }, [fetchInviteLink]);

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
                                <Loading show={loading} />
                                {
                                    !loading && (
                                        <TextField
                                            value={inviteLink}
                                            disabled
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">URL do Convite: </InputAdornment>
                                            }}
                                        />
                                    )
                                }
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
            <Button
                color="primary"
                onClick={openModal}
                variant="outlined"
            >
                { 'Convidar' }
            </Button>
        </React.Fragment>
    );
}