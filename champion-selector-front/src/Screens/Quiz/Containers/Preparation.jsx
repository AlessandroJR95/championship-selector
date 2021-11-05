import React from 'react';
import { Preparation as PreparationView } from '../Components/Preparation';
import { useClientStateContext } from '../../../Core/Client';

function PreparationContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });

    return (
        <PreparationView
            {...props}
            isOwner={state.isOwner}
            startChampionship={actions.startChampionship}
            participantList={state.participantList}
            judgeList={state.judgeList}
            judgeID={state.judgeID}
            canStartChampionship={state.canInput}
            allReady={state.allReady}
            isReady={state.isReady}
            onReadyClick={actions.imJudgeAndImReady}
            onJudgeKick={actions.kickJudge}
            readyQuiz={actions.readyQuiz}
            multiple={state.multiple}
        />
    );
}

export const Preparation = React.memo(PreparationContainer);