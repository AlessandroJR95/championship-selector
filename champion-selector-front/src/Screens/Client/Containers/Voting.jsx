import React from 'react';
import { Voting as VotingView } from '../Components/Voting';
import { useClientStateContext } from '../../../Core/Client';

function VotingContainer(props) {
    const [ state, actions ] = useClientStateContext({ championshipID: props.championshipID });

    return (
        <VotingView
            {...props}
            isOwner={state.isOwner}
            participantList={state.participantList}
            judgeList={state.judgeList}
            whoVoted={state.whoVoted}
            judgeID={state.judgeID}
            round={state.round}
            progress={state.progress}
            addVote={actions.addVote}
            canVote={!state.hasVoted && state.canInput}
            winner={state.winners[state.roundIndex - 1]}
            roundHistory={state.roundHistory}
            roundName={state.roundName}
            VotingInputCmp={props.VotingInputCmp}
            onJudgeKick={actions.kickJudge}
            roundIndex={state.roundIndex}
            scoreboard={state.scoreboard}
            fetchInviteLink={actions.fetchInviteLink}
            likeList={state.likeList}
        />
    );
}

export const Voting = React.memo(VotingContainer);