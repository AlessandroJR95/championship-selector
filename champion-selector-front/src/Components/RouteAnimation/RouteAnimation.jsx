import React from 'react';
import { CSSTransition } from "react-transition-group";
import './RouteAnimation.css';

export function RouteAnimation(props) {
    return (
        <CSSTransition
            in={props.match != null}
            timeout={300}
            classNames={"page"}
            unmountOnExit
        >
            <div className={"page"}>
                {props.children}
            </div>
        </CSSTransition>
    );
}