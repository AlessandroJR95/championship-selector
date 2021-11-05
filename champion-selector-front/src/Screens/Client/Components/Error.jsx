import React from 'react';
import { Error as ErrorCmp } from '../../../Components/Error';
import { Center } from '../../../Components/Center';

export function Error(props) {
    return (
        <Center>
            <ErrorCmp message={props.message} />
        </Center>
    );
}