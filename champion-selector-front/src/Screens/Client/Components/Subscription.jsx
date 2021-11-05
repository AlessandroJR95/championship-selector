import React from 'react';
import Box from "@material-ui/core/Box";
import { Center } from '../../../Components/Center';
import { ShareChampionship } from '../../../Components/ShareChampionship';
import { JudgeNameInput } from '../../../Components/JudgeNameInput'

function SubscriptionView (props) {
    const [ name, setName ] = React.useState('');
    const [ icon, setIcon ] = React.useState('AccountCircle');
    const { onSubmit } = props;

    const onSubmitProxy = React.useCallback((judgeInfo) => {
        onSubmit({ judge: judgeInfo });
    }, [onSubmit]);

    return (
        <Center>
             <Box style={{ padding: '0 10px' }}>
                <ShareChampionship
                    url={window.location.href}
                />
            </Box>
            <Box style={{ padding: '0 10px', marginTop: 50 }}>
                <JudgeNameInput
                    name={name}
                    onChangeName={setName}
                    onSubmit={onSubmitProxy}
                    icon={icon}
                    onChangeIcon={setIcon}
                    canEnter={props.canEnter}
                />
            </Box>
        </Center>
    );
}

export const Subscription = React.memo(SubscriptionView);