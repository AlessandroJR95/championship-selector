import React from 'react';
import Button from '@material-ui/core/Button';

export function MovieRerollButton(props) {
    return (
        <Button
            color="primary"
            onClick={props.onClick}
            disabled={props.disabled}
        >
            Reroll
        </Button>
    );
}