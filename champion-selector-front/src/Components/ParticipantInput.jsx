import React from 'react';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';

export function ParticipantInput(props) {
    const [ value, setValue ] = React.useState('');
    const { addParticipant } = props;

    const onClick = React.useCallback(() => {
        addParticipant(value);
        setValue('');
    }, [addParticipant, value]);

    const onChange = React.useCallback((e) => {
        setValue(e.target.value);
    }, [setValue]);

    const onKeyPress = React.useCallback((evt) => {
        if (evt.key === 'Enter') {
            onClick();
        }
    }, [onClick]);

    return (
        <Box style={{ padding: '0 10px' }}>
            <TextField
                value={value}
                onChange={onChange}
                placeholder={'Sugira um nome!'}
                fullWidth
                variant="outlined"
                disabled={!props.canAddParticipant}
                autoFocus
                onKeyPress={onKeyPress}
                InputProps={{
                    endAdornment: (
                        <InputAdornment>
                            <IconButton
                                color="secondary"
                                onClick={onClick}
                                disabled={!props.canAddParticipant}
                            >
                                <SendIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
        </Box>
    );
}