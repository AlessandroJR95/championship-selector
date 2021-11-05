import React from 'react';
import Grid from '@material-ui/core/Grid';

export function Center(props) {
    return (
        <Grid
            container
            spacing={0}
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
        >
            <Grid item xs={12} style={{ textAlign: 'center', position: 'relative' }}>
                {props.children}
            </Grid>
        </Grid>
    );
}