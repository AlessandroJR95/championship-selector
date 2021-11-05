import React from 'react';
import { Winner as WinnerView } from '../Components/Winner';
import { useClientStateContext } from '../../../Core/Client';

function WinnerContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });

    return (
        <WinnerView
            {...props}
            winner={state.winner}
            onRestart={actions.restartChampionship}
            isOwner={state.isOwner}
            winners={state.winners}
            scoreboard={state.scoreboard}
            report={state.report}
        />
    );
}

export const Winner = React.memo(WinnerContainer);