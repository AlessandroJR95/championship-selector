import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './TransitionList.css';

export function TransitionList(props) {
    const { items, Item, getKey } = props;

    return (
        <TransitionGroup>
            {
                items.map((item, index, all) => (
                    <CSSTransition 
                        key={getKey(item)}
                        timeout={300}
                        classNames={'item'}
                    >
                        {Item(item, index, all)}
                    </CSSTransition>
                ))
            }
        </TransitionGroup>
    );
}