import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import NotificationHandler from '../Core/notification';

const Notification = () => {
    const [ open, setOpen ] = React.useState(false);
    const [ info, setInfo ] = React.useState({ type: null, message: null });

    React.useEffect(() => {
        let timeout;

        if (open) {
            timeout = setTimeout(() => {
                setOpen(false);
            }, 6000);
        }

        return () => {
            clearTimeout(timeout);
        }
    }, [open, setOpen]);

    React.useEffect(() => {
        const unsubscribe = NotificationHandler.subscribe(
            (info) => {
                setInfo(info);
                setOpen((flag) => !flag);
            }
        );

        return () => {
            unsubscribe();
        }
    }, [setInfo, setOpen]);

    return (
        <Snackbar
            open={open}
        >
            <Alert severity={info.type}>{info.message}</Alert>
        </Snackbar>
    );
}

export default Notification;