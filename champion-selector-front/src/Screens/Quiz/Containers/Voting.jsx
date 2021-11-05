import React from 'react';
import { Voting as VotingView } from '../Components/Voting';
import { useClientStateContext } from '../../../Core/Client';

function VotingContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });

    return (
        <VotingView
            {...props}
            isOwner={state.isOwner}
            isQuestionOwner={state.isQuestionOwner}
            participantList={state.participantList}
            judgeList={state.judgeList}
            whoVoted={state.whoVoted}
            judgeID={state.judgeID}
            round={state.round}
            progress={state.progress}
            addVote={actions.addVote}
            canVote={!state.hasVoted && state.canInput}
            winner={state.winners[state.roundIndex - 1]}
            result={state.result}
            ownResult={state.ownResult}
            onJudgeKick={actions.kickJudge}
            roundIndex={state.roundIndex}
            scoreboard={state.scoreboard}
            question={state.question}
        />
    );
}

export const Voting = React.memo(VotingContainer);