import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

export function Loading(props) {
    const [ render, setRender ] = React.useState(props.show);
    const { show } = props;

    React.useEffect(() => {
        let timeout;

        if (show) {
            timeout = setTimeout(() => {
                setRender(true);
            }, 200);
        } else {
            setRender(false);
        }

        return () => {
            clearTimeout(timeout);
        }
    }, [show]);

    return render ? (
        <LinearProgress color={'secondary'} />
    ) : null;
}