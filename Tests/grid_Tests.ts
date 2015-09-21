/// <reference path="../Scripts/grid.ts"/>
/// <reference path="../Scripts/state.ts"/>

module Grid_Tests {

    import Direction = State.Direction;
    import Tile = State.Tile;
    import TileType = State.TileType;

    QUnit.module("Grid tests");

    const gridSize = 4;

    test("isOccupied test", () => {
        let grid = new Model.Grid(gridSize);

        grid.setValue({ x: 0, y: 0, value: 2 });

        equal(grid.isOccupied({ x: 0, y: 0 }), true, 'cell should be occupied');
    });

    test("isFull test", () => {
        let grid = new Model.Grid(gridSize);

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                grid.setValue({ x: x, y: y, value: 2 });
            }
        }

        equal(grid.isFull(), true, 'grid should be full');
    });

    test("Simple moves", () => {
        let grid = new Model.Grid(gridSize);
        grid.setValue({ x: 0, y: 0, value: 2 });

        // 2, , , ,  ->  , , ,2,
        //  , , , ,  ->  , , , ,
        //  , , , ,  ->  , , , ,
        //  , , , ,  ->  , , , ,

        let moveResult = grid.move(Direction.Right);

        equal(moveResult.length, 1);
        equal(moveResult[0].value, 2);
        equal(moveResult[0].type, TileType.Moved);
        equal(moveResult[0].x, gridSize - 1);
        equal(moveResult[0].y, 0);
        equal(grid.isOccupied({ x: 0, y: 0 }), false, 'Tile should be moved');
        equal(grid.isOccupied({ x: gridSize - 1, y: 0 }), true, 'New position should be occupied');
        
        // 2, , ,2,  ->  , , ,4,
        //  , , , ,  ->  , , , ,
        //  , , , ,  ->  , , , ,
        //  , , , ,  ->  , , , ,

        grid.setValue({ x: 0, y: 0, value: 2 });
        moveResult = grid.move(Direction.Right);
        equal(moveResult.length, 1);
        equal(moveResult[0].value, 4);

        //  , , , ,  d  , , ,4,
        //  , , , ,  o  , , , ,
        //  , , , ,  w  , , , ,
        //  , , ,4,  n  , , , ,
        moveResult = grid.move(Direction.Down);
        equal(moveResult.length, 1);
        equal(moveResult[0].value, 4);
        equal(moveResult[0].x, gridSize - 1, `x should be 3 but was ${moveResult[0].x}`);
        equal(moveResult[0].y, gridSize - 1, `y should be 3 but was ${moveResult[0].y}`);
        equal(grid.isOccupied({x: gridSize - 1, y: gridSize - 1}), true, 'New position should be occupied');

        //  , , , ,  <  , , , ,
        //  , , , ,  <  , , , ,
        //  , , , ,  <  , , , ,
        // 4, , ,4,  < 8, , , ,
        grid.setValue({ x: 0, y: 3, value: 4 });
        moveResult = grid.move(Direction.Left);
        equal(moveResult[0].value, 8);
        equal(moveResult[0].x, 0, `x should be 0 but was ${moveResult[0].x}`);
        equal(moveResult[0].y, gridSize - 1, `y should be 3 but was ${moveResult[0].y}`);
        equal(grid.isOccupied({ x: 0, y: gridSize - 1 }), true, 'New position should be occupied');
        equal(grid.valueAt(0, gridSize - 1), 8);
    });

    test("move with empty space between", () => {
        //  , , , ,  < 4, , , ,
        // 2, , , ,  <  , , , ,
        //  , , , ,  <  , , , ,
        // 2, , , ,  <  , , , , 

        let grid = new Model.Grid(gridSize);
        grid.setValue({ x: 0, y: 1, value: 2 });
        grid.setValue({ x: 0, y: 3, value: 2 });

        let moveResult = grid.move(Direction.Up);
        equal(moveResult.length, 1, `Tiles: ${moveResult.map(x => x.value).join(", ") }.\r\nGrid:\r\n${grid.toString() }`);

    });

    test("first advanced move", () => {
        //  , , , ,  ^ 2,2,8,4,
        //  ,2,4, ,  ^ 8, ,2, ,
        // 2, ,4, ,  ^  , , , ,
        // 8, ,2,4,  ^  , , , , 

        let grid = new Model.Grid(gridSize);
        //[, , , ].forEach((v, idx) => { grid.setValue({ x: idx, y: 0, value: v }) });
        [, 2, 4, ,].forEach((v, idx) => { grid.setValue({ x: idx, y: 1, value: v }) });
        [2, , 4, ,].forEach((v, idx) => { grid.setValue({ x: idx, y: 2, value: v }) });
        [8, , 2, 4].forEach((v, idx) => { grid.setValue({ x: idx, y: 3, value: v }) });

        let moveResult = grid.move(Direction.Up);

        equal(grid.valueAt(0, 0), 3, grid.toString());
        equal(grid.valueAt(0, 1), 8);
        equal(grid.valueAt(1, 0), 2);
        equal(grid.valueAt(2, 0), 8);
        equal(grid.valueAt(2, 1), 2, grid.toString());
        equal(moveResult.length, 6, `Tiles: ${moveResult.map(x => x.value).join(", ")}.\r\nGrid:\r\n${grid.toString()}`);
    });

    test("second advanced move", () => {
        // 2,2,4, ,  < 4,4, , ,
        //  , , , ,  <  , , , ,
        //  , , , ,  <  , , , ,
        //  , , , ,  <  , , , , 

        let grid = new Model.Grid(gridSize);
        [2, 2, 4].forEach((v, idx) => { grid.setValue({ x: idx, y: 0, value: v }) });

        let moveResult = grid.move(Direction.Right);
        equal(moveResult.length, 2, `Tiles: ${moveResult.map(x => x.value).join(", ") }.\r\nGrid:\r\n${grid.toString() }`);
        equal(grid.valueAt(3, 0), 4);
        equal(grid.valueAt(2, 0), 4);
    });

    test("test full grid", () => {
        // 4,2,8,2,  ^ 
        // 2,8,4,4,  ^ 
        // 8,2,8,8,  ^ 
        // 2,4,4,4,  ^ 

        let grid = new Model.Grid(gridSize);
        [4, 2, 8, 2].forEach((v, idx) => { grid.setValue({ x: idx, y: 0, value: v }) });
        [2, 8, 4, 4].forEach((v, idx) => { grid.setValue({ x: idx, y: 1, value: v }) });
        [8, 2, 8, 8].forEach((v, idx) => { grid.setValue({ x: idx, y: 2, value: v }) });
        [2, 4, 4, 4].forEach((v, idx) => { grid.setValue({ x: idx, y: 3, value: v }) });

        let moveResult = grid.move(Direction.Up);
        equal(Tile.hasMovesOrMerges(moveResult), false, `Grid:\r\n${grid.toString() }`);

        equal(grid.hasMoves(), true, `Moves still should be available!`);
    });

    test("test no moves", () => {
        // 4,2,8,2,
        // 2,8,4,8, 
        // 8,2,8,2, 
        // 2,8,2,4, 

        let grid = new Model.Grid(gridSize);
        [4, 2, 8, 2].forEach((v, idx) => { grid.setValue({ x: idx, y: 0, value: v }) });
        [2, 8, 4, 8].forEach((v, idx) => { grid.setValue({ x: idx, y: 1, value: v }) });
        [8, 2, 8, 2].forEach((v, idx) => { grid.setValue({ x: idx, y: 2, value: v }) });
        [2, 8, 2, 4].forEach((v, idx) => { grid.setValue({ x: idx, y: 3, value: v }) });

        let moveResult = grid.move(Direction.Up);
        equal(Tile.hasMovesOrMerges(moveResult), false, `Grid:\r\n${grid.toString() }`);

        equal(grid.hasMoves(), false, `no moves!`);
    });
    //------------------------------------------------------------------------
    // Helper functions
    //------------------------------------------------------------------------
    function createGrid() {
        return new Model.Grid(gridSize);
    }
}