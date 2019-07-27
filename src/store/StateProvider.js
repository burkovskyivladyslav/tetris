import React from 'react';
import StateContext from './StateContext';
import defaultState from './defaultState';

function StateProvider(props) {
    const [grid, setGrid] = React.useState(defaultState.grid);
    const [currentBlock, setCurrentBlock] = React.useState(defaultState.currentBlock);

    const state = React.useMemo(() => ({ grid, currentBlock }), [grid, currentBlock]);

    return <StateContext.Provider value={state}>{props.children}</StateContext.Provider>;
}

export default StateProvider;
