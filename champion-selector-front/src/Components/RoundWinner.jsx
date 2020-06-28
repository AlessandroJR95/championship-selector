import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { Fade } from './Fade/Fade';
import { WinnerBadge } from './WinnerBadge';

export function RoundWinner(props) {
    const [ showIntroduction, setShowIntroduction ] = React.useState(false);
    const { onTransitionEnd, fadeOut } = props;

    const dismissAnnoucer = React.useCallback(() => {
        setTimeout(() => {
            if (fadeOut) {
                setShowIntroduction(false);
            }
        }, 1500);
    }, [setShowIntroduction, fadeOut]);

    React.useLayoutEffect(() => {
        setShowIntroduction(true);
    }, []);

    return (
        <React.Fragment>
            <Fade show={showIntroduction} longer>
                <Box textAlign='center'>
                    <Typography variant="h5" component="h5" color={'primary'}>
                        {props.preparationText}
                    </Typography>
                </Box>
                <Fade show={showIntroduction} longer delay={3000} onEntered={dismissAnnoucer} onExited={onTransitionEnd}>
                    <Box textAlign='center'>
                        <Typography variant="h3" component="h5" color={'secondary'}>
                            {props.roundWinner}
                        </Typography>
                    </Box>
                </Fade>
                <Box textAlign='center'>
                    {
                        props.roundWinnerBadges.length ? (
                            <Box padding={1}>
                                <WinnerBadge
                                    badges={props.roundWinnerBadges}
                                />
                            </Box>
                        ) : null
                    }
                    <Box padding={1}>
                        { props.children }
                    </Box>
                </Box>
            </Fade>
        </React.Fragment>
    );
}