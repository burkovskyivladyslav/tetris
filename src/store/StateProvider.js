import React from 'react';
import StateContext from './StateContext';
import defaultState, { STARTING_BLOCK_COORDINATES } from './defaultState';
import rotateBlock from 'blocks/rotation';
import { MOVEMENT_DIRECTIONS, getRandomNewBlock } from 'blocks';
import getCurrentBlockCellCoordinateMap from 'blocks/cellCoordinateMap';
import { isWithinGridBounds, cloneGrid } from 'grid';

function StateProvider(props) {
    const [grid, setGrid] = React.useState(defaultState.grid);
    const [currentBlock, setCurrentBlock] = React.useState(defaultState.currentBlock);
    const currentBlockCellCoordinateMap = React.useRef(null);

    function rotateCurrentBlock() {
        const { positionCoordinates, properties } = currentBlock;
        const rotatedBlockShape = rotateBlock(properties.shape);

        if (isWithinGridBounds(grid, positionCoordinates, rotatedBlockShape)) {
            setCurrentBlock(prevBlock => ({
                ...prevBlock,
                properties: {
                    ...prevBlock.properties,
                    shape: rotatedBlockShape,
                },
            }));
        }
    }

    function moveCurrentBlock(direction) {
        const [row, col] = currentBlock.positionCoordinates;

        let newCoords;
        switch (direction) {
            case MOVEMENT_DIRECTIONS.LEFT:
                newCoords = [row, col - 1];
                break;
            case MOVEMENT_DIRECTIONS.RIGHT:
                newCoords = [row, col + 1];
                break;
            case MOVEMENT_DIRECTIONS.DOWN:
                newCoords = [row + 1, col];
                break;
            default:
                // No movement
                newCoords = [row, col];
        }

        if (isWithinGridBounds(grid, newCoords, currentBlock.properties.shape)) {
            setCurrentBlock(prevBlock => ({
                ...prevBlock,
                positionCoordinates: newCoords,
            }));
        } else {
            if (direction === MOVEMENT_DIRECTIONS.DOWN) {
                commitCurrentBlock();
            }
        }
    }

    function commitCurrentBlock() {
        /**
         * Get the list of coordinates for the current block
         * and then update the grid with those values.
         */
        const coords = currentBlockCellCoordinateMap.current.keysArray();
        const newGrid = cloneGrid(grid);
        coords.forEach(coord => {
            const [row, col] = coord;
            newGrid[row][col] = currentBlock.properties.type;
        });

        setGrid(newGrid);

        /**
         * Generate new current block.
         */
        setCurrentBlock({
            properties: getRandomNewBlock(),
            positionCoordinates: STARTING_BLOCK_COORDINATES,
        });
    }

    /**
     * Compute cell coordinate map for current block.
     */
    currentBlockCellCoordinateMap.current = getCurrentBlockCellCoordinateMap(
        currentBlock.properties.shape,
        currentBlock.positionCoordinates
    );

    const state = React.useMemo(
        () => ({
            grid,
            currentBlock,
            currentBlockCellCoordinateMap: currentBlockCellCoordinateMap.current,
            rotateCurrentBlock,
            moveCurrentBlock,
        }),
        [grid, currentBlock, currentBlockCellCoordinateMap]
    );

    return <StateContext.Provider value={state}>{props.children}</StateContext.Provider>;
}

export default StateProvider;
