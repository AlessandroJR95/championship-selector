import React from 'react';
import { Preparation as PreparationView } from '../Components/Preparation';
import { useClientStateContext } from '../../../Core/Client';

function PreparationContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });

    return (
        <PreparationView
            isOwner={state.isOwner}
            startChampionship={actions.startChampionship}
            addParticipant={actions.addParticipant}
            participantList={state.participantList}
            judgeList={state.judgeList}
            judgeID={state.judgeID}
            canAddParticipant={state.canInput}
            disableListDelete={!state.canInput}
            onParticipantDelete={actions.deleteParticipant}
            allReady={state.allReady}
            isReady={state.isReady}
            onReadyClick={actions.imJudgeAndImReady}
            onJudgeKick={actions.kickJudge}
        />
    );
}

export const Preparation = React.memo(PreparationContainer);