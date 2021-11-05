import React from 'react';
import { render } from '@testing-library/react';
import { useClientStateContext, Provider } from './Client';

function MockClient(props) {
    const [ state, actions ] = useClientStateContext();

    return (
        <div>
            {JSON.stringify(state)}
        </div>
    );
}


describe('Client tests', () => {
    it('should get initial state', () => {
        const { container } = render(
            <Provider>
                <MockClient />
            </Provider>
        );

        expect(container).toEqual('');
    });
});
