import React from 'react';
import { Winner as WinnerView } from '../Components/Winner';
import { useClientStateContext } from '../../../Core/Client';

function WinnerContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });

    return (
        <WinnerView
            {...props}
            winner={state.winners[state.winners.length - 1]}
            onRestart={actions.restartChampionship}
            isOwner={state.isOwner}
            winners={state.winners}
            scoreboard={state.scoreboard}
        />
    );
}

export const Winner = React.memo(WinnerContainer);