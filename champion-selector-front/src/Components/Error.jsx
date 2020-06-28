import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Warning from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';

export function Error(props) {
    return (
        <Box style={{padding: 10}}>
            <Paper style={{ padding: 10 }}>
                <Grid container>
                    <Grid item xs={12}>
                        <Warning fontSize='large' color={'error'}/>
                        <Typography variant={'subtitle1'} color={'error'}>
                            {props.message}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}