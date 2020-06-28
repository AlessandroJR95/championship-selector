import React from 'react';

const LoadingContext = React.createContext();

export function useLoadingContext() {
    const context = React.useContext(LoadingContext);
    return context;
}

export function Provider(props) {
    const [ loading, setLoading ] = React.useState(false);
    const value = React.useMemo(() => ({loading, setLoading}), [loading, setLoading]);

    return (
        <LoadingContext.Provider value={value}>
            {props.children}
        </LoadingContext.Provider>
    );
}