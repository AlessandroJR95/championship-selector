import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import CopyIcon from '@material-ui/icons/FileCopy';
import Notification from '../Core/notification';

function ShareAddornment(props) {
    const { url } = props;

    const onClick = React.useCallback(() => {
        window.navigator.share({
            title: 'Venha meu gazebo',
            text: 'Venha tunado',
            url,
        }).then(() => {
            Notification.success('URL compartilhada!');
        });
    }, [url]);

    return (
        <InputAdornment>
            <IconButton
                color="primary"
                onClick={onClick}
            >
                <ShareIcon />
            </IconButton>
        </InputAdornment>
    );
}

function ClipboardAddornment(props) {
    const { url } = props;

    const onClick = React.useCallback(() => {
        navigator.clipboard.writeText(url).then(() => {
            Notification.success('URL copiada!');
        });
    }, [url]);

    return (
        <InputAdornment>
            <IconButton
                color="primary"
                onClick={onClick}
            >
                <CopyIcon />
            </IconButton>
        </InputAdornment>
    );
}

export function ShareChampionship(props) {
    const { url } = props;

    const EndAddornment = React.useMemo(() => {
        if (window.navigator.share) {
            return <ShareAddornment url={url} />;
        }

        if (window.navigator.clipboard) {
            return <ClipboardAddornment url={url} />;
        }
    }, [url]);

    return (
        <TextField
            value={url}
            disabled
            fullWidth
            InputProps={{
                startAdornment: <InputAdornment position="start">URL da Sala: </InputAdornment>,
                endAdornment: EndAddornment
            }}
        />
    );
}