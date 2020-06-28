import React from 'react';
import { Subscription as SubscriptionView } from '../Components/Subscription';
import { useClientStateContext } from '../../../Core/Client';

function SubscriptionContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });
    
    return (
        <SubscriptionView
            onSubmit={actions.enterChampionship}
            championshipID={props.championshipID}
            canEnter={state.canInput}
        />
    );
}

export const Subscription = React.memo(SubscriptionContainer);