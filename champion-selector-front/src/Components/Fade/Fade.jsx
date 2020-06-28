import React from 'react';
import { CSSTransition } from "react-transition-group";
import './Fade.css';

function getClassNames(name, toMerge) {
    return Object.assign({
        appear: `${name}-appear`,
        appearActive: `${name}-active-appear`,
        appearDone: `${name}-done-appear`,
        enter: `${name}-enter`,
        enterActive: `${name}-active-enter`,
        enterDone: `${name}-done-enter`,
        exit: `${name}-exit`,
        exitActive: `${name}-active-exit`,
        exitDone: `${name}-done-exit`,
    }, toMerge);
}

function getLongerFadeClasses() {
    return {
        enterActive: 'longer-fade-enter-active',
        exitActive: 'longer-fade-exit-active'
    };
}

function getTimeout(longer, delay) {
    return {
        appear: 300,
        enter: longer ? 3000 + delay : 300 + delay,
        exit: 1000,
    };
}

export function Fade(props) {
    return (
        <CSSTransition
            in={props.show}
            timeout={getTimeout(props.longer, props.delay)}
            classNames={getClassNames("fade", props.longer ? getLongerFadeClasses() : null)}
            unmountOnExit={props.unmountOnExit}
            onExited={props.onExited}
            onEntered={props.onEntered}
        >
            <div className={"fade"} style={{transitionDelay: `${props.delay}ms`}}>
                {props.children}
            </div>
        </CSSTransition>
    );
}

Fade.defaultProps = {
    delay: 0,
    show: false,
    longer: false
}