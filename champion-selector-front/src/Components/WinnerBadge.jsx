import React from 'react';
import Chip from '@material-ui/core/Chip';

function getBadgeText(badgeList) {
    switch (badgeList[0].type) {
        case 'ALL_IN_ONE':
            return 'Unânime';
        case 'CLOSE_AS_FUCK':
            return `Decidido por ${badgeList[0].value.decider}`;
        case 'DRAW':
            return 'Empate';
        default:
            return '';
    }
}

export function WinnerBadge(props) {
    return (
        <Chip label={getBadgeText(props.badges)} variant={"outlined"} />
    );
}