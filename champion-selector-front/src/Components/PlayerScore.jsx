import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { AnimatedList } from './AnimatedList';

function getPlayerScore(scoreboard, judgeID) {
    const playerScore = scoreboard.filter((score) => score.id === judgeID);

    if (playerScore[0]) {
        return playerScore[0].points;
    }

    return 0;
}

export function HorizontalPeao(props) {
    const { value, width, height, render } = props;
    const [ animation, setAnimation ] = React.useState([
        { id: 'future', value: null },
        { id: 'actual', value: value },
        { id: 'past', value: null }
    ]);

    const getKey = React.useCallback((item) => item.id, []);

    const Render = React.useCallback((item) => {
        return (
            <div key={item.id} ref={item.ref} style={{ width, height }}>
                {render(item.value)}
            </div>
        );
    }, [width, height, render]);

    React.useLayoutEffect(() => {
        setAnimation((state) => {
            return (
                [
                    { id: 'future', value: value ? value : null },
                    { id: 'actual', value: state[1].value },
                    { id: 'past', value: null }
                ]
            );
        });
    }, [value]);

    React.useLayoutEffect(() => {
        if (animation[0].value) {
            setAnimation((state) => { 
                return (
                    [
                        { id: 'past', value: null },
                        { id: 'future', value: state[0].value },
                        { id: 'actual', value: state[1].value }
                    ]
                );
            });
        }
    }, [animation]);
    
    return (
        <div style={{ overflow: 'hidden', width, height, position: 'relative' }}>
            <div style={{ position: 'absolute', top: (height * -1) }}>
                <AnimatedList 
                    data={animation}
                    getKey={getKey}
                    Item={Render}
                />
            </div>
        </div>
    );
}

HorizontalPeao.defaultProps = {
    width: 100,
    height: 50
};

export function PlayerScore(props) {
    const { scoreboard, judgeID, shouldUpdateScore } = props;
    const [ scoreboardState, setScoreboard ] = React.useState(scoreboard);
    const [ shouldUpdate, setShouldUpdate ] = React.useState(shouldUpdateScore);

    const Render = React.useCallback((item) => {
        return (
            <Typography variant='h3' component='h3' color={'secondary'}>
                {item}
            </Typography>
        );
    }, []);

    React.useEffect(() => {
        if (shouldUpdate) {
            setScoreboard(scoreboard);
            setShouldUpdate(false);
        }
    }, [shouldUpdate, scoreboard]);

    React.useEffect(() => {
        if (shouldUpdateScore) {
            setShouldUpdate(true);
        }
    }, [shouldUpdateScore]);

    return (
        <Paper style={{ display: 'flex', marginTop: 10, padding: 10, alignItems: 'center' }}>
            <Box>
                <Typography variant='h4' component='h4' color={'primary'}>
                    {'Pontuação'}
                </Typography>
            </Box>
            <HorizontalPeao
                value={getPlayerScore(scoreboardState, judgeID)}
                render={Render}
            />
        </Paper>
    );
}