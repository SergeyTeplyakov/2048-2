/// <reference path="state.ts"/>
/// <reference path="Utils.ts"/>
/// <reference path="contract.ts"/>

module Model {

    import Cell = State.Cell;
    import Tile = State.Tile;
    import TileState = State.TileState;
    import TileValue = State.TileValue;
    import Direction = State.Direction;
    import TileType = State.TileType;
    import GridState = State.GridState;

    interface Vector {
        dx: number,
        dy: number,
    }

    // Vectors representing tile movement
    let directionMap = {
        0: { dx: 0, dy: -1 }, // Up
        1: { dx: 1, dy: 0 },  // Right
        2: { dx: 0, dy: 1 },  // Down
        3: { dx: -1, dy: 0 }   // Left
    };


    export class Grid {
        private cells: TileValue[][];

        constructor(public size: number, previousState?: Array<TileState>) {
            this.cells = this.emptyGridOfValues(size);
        }

        //-----------------------------------------------------------------------------------------
        // Public Interface
        //-----------------------------------------------------------------------------------------

        // [pure] Returns true when cell is withing current grid size
        public isInRange(cell: Cell): boolean {
            Contract.requires(notNull(cell), 'cell should not be null or undefined');

            return (cell.x >= 0 && cell.x < this.size) && (cell.y >= 0 && cell.y < this.size);
        }

        /**
         * [pure] Returns value for specified cell.
         */
        public valueAt(x: number, y: number): TileValue {
            Contract.requires(this.isInRange({x: x, y :y}), 'x and y should be within bounds.');

            return this.cells[x][y];
        }

        /**
         * [pure] Returns true if psecified cell is occupied.
         */
        public isOccupied(cell: Cell): boolean {
            Contract.requires(this.isInRange(cell), 'cell should not be out of range');

            return !!this.valueAt(cell.x, cell.y);
        }

        /**
         * [pure] Returns true if the grid is full.
         */
        public isFull(): boolean {
            return this.availableCells().length === 0;
        }

        /**
         * [pure] Returns state for current grid instance.
         */
        public state(): GridState {
            let nonEmptyCells: TileState[] = [];

            this.eachCell((x, y, value) => {
                if (value) {
                    nonEmptyCells.push({ x: x, y: y, value: value });
                }
            });

            return {
                size: this.size,
                cells: nonEmptyCells
            }
        }

        /**
         * [pure] Returns first random available cell.
         */
        public randomAvailableCell(): Cell {
            Contract.requires(!this.isFull(), `Grid should not be full`);

            var resultingCells = this.availableCells();
            // Don't need to check returned value length. Precondition should check this
            return resultingCells[Math.floor(Math.random() * resultingCells.length)];
        }

        /**
         * [not pure] Change cells internal state.
         */
        public setValue(tile: { x: number, y: number, value: number }) {
            Contract.requires(!this.isFull(), `Grid should not be full`);
            Contract.requires(!this.isOccupied(tile), 'Tile should not be occupied');
            Contract.requires(notNull(tile.value), 'value should not be null or undefined');

            this.cells[tile.x][tile.y] = tile.value;
        }

        /**
         * [not pure] Change the grid state by 'moving' all the tiles in specific direction.
         * Resulting list contains all non-empty tiles for the new state.
         */
        public move(direction: Direction): Tile[] {
            // This implementation is not very performant, but much more readable!
            // For grids with 4x4 this doesn't matter at all!
            let newGridState = this.doMove(direction);

            let stateCells: Array<Tile> = [];

            Utils.forEach(newGridState, (x, y, tile) => {
                Contract.assert(notNull(tile), 'All tiles in grid state should not be null or undefined');
                
                if (notNull(tile.value) && tile.type !== TileType.Empty) {
                    stateCells.push(tile);
                }

                // Applying new state to the grid instance.
                this.cells[x][y] = tile.value;
            });

            return stateCells;
        }

        /**
         * [pure] Returns true if there is no moves for the grid.
         */
        public hasMoves() {
            // Has moves if not full
            if (!this.isFull()) {
                return true;
            }

            // More complex scenario: trying to move each direction
            // and return true if at least one possible move is possible
            return [Direction.Up, Direction.Right, Direction.Down, Direction.Left]
                .map(d => this.tryMove(d))
                .some(mr => mr.length !== 0);
        }

        /**
         * [pure] Returns string represenation for the grid.
         */
        public toString() {
            let result: string = "";

            // To get more appropriate view, need to print this stuff with per-column bases            
            for (let y = 0; y < this.size; y++) {
                let row = [];
                for (let x = 0; x < this.size; x++) {
                    row.push(this.cells[x][y]);
                }

                result += row.map(c => c ? c.toString() : " ").join(", ");
                result += "\r\n";
            }

            return result;
        }

        //----------------------------------------------------------------------------------
        // 'Private' methods
        //----------------------------------------------------------------------------------

        private emptyGridOfValues(size: number): Array<TileValue[]> {
            var cells = new Array<TileValue[]>(size);

            for (let x = 0; x < size; x++) {
                cells[x] = new Array<TileValue>(size);

                // TileValue is a primitive, no need to create an instance for each cell
            }

            return cells;
        }

        // Creates grid of tiles based on current state
        private newGridOfTiles(): Array<Tile[]> {
            let size = this.size;
            var cells = new Array<Tile[]>(size);

            for (let x = 0; x < size; x++) {
                let row = new Array<Tile>(size);

                for (let y = 0; y < size; y++) {
                    row[y] = State.Tile.oldTile(x, y, this.cells[x][y]);
                }

                cells[x] = row;
            }

            return cells;
        }

        private eachCell(callback: (x: number, y: number, value: TileValue) => void): void {
            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    callback(x, y, this.cells[x][y]);
                }
            }
        }

        private availableCells(): Array<Cell> {
            let cells = new Array<Cell>();

            this.eachCell((x, y, tile) => {
                if (!tile) {
                    cells.push({ x: x, y: y });
                }
            });

            return cells;
        }

        public tileAt(x: number, y: number): Tile {
            Contract.requires(this.isInRange({ x: x, y: y }), 'x and y should be within bounds.');

            return State.Tile.oldTile(x, y, this.cells[x][y]);
        }

        private tileFrom(x: number, y: number, grid: Tile[][]): Tile {
            if ((x >= 0 && x < this.size) && (y >= 0 && y < this.size)) {
                return grid[x][y];
            }

            return undefined;
        }

        /**
         * Returns farthest tile for specified tile.
         */
        private getTheFarthestDestinationTile(tile: Tile, vector: Vector, grid: Tile[][]): Tile {
            // --->
            // 2, , , ,
            // After
            //  , , ,2,
            // result: Tile with (0, 2) and value undefined

            // --->
            // 2, , ,2,
            // After
            //  , , ,4,
            // result: Tile with (0, 2) and value 2

            Contract.requires(notNull(tile), 'Tile should not be null');
            Contract.requires(notNull(tile.value), 'Tie that moves should have a value');
            Contract.ensures(true, 'Result should not be null'); // this is for documentation purposes

            // Saving current tile because it will help to get previous result
            let previousCandidate = tile;
            while (true) {
                // Progress towards the vector direction until mergeable candidate is found
                let candidate = this.tileFrom(previousCandidate.x + vector.dx, previousCandidate.y + vector.dy, grid);

                // Merged tile still could move to the edge of the grid, but should
                // not merge with any other tiles
                if (candidate && candidate.value === tile.value &&
                    candidate.type !== State.TileType.Merged && tile.type !== State.TileType.Merged) {
                    return candidate;
                }

                // Reached the bound of the grid or non-empty tile
                if (!candidate || candidate.value) {
                    return previousCandidate;
                }

                previousCandidate = candidate;
            }

            // code is unreachable
            return previousCandidate;
        }

        /*pure*/
        private tryMove(direction: Direction) {
            let stateCells: Array<Tile> = [];

            let newGridState: Tile[][] = this.doMove(direction);

            Utils.forEach(newGridState, (x, y, tile) => {
                Contract.assert(notNull(tile), 'All tiles in grid state should not be null or undefined');

                if (tile.value && tile.type === TileType.Merged) {
                    stateCells.push(tile);
                }
            });

            return stateCells;
        }

        /**
         * [pure] Move tiles on the grid in the specified direction.
         */
        private doMove(direction: Direction): Tile[][] {
            let grid = this.newGridOfTiles();
            //let grid = this.createGridState();

            let vector = directionMap[direction];
            let traversals = this.buildTraversals(direction);
    
            // Traverse the grid in the right direction and move tiles
            this.iterateOver(traversals, (x, y) => {
                let tile = this.tileFrom(x, y, grid);
                
                // Only non-empty tiles could change the location during the move
                if (tile.value) {
                    // Looking for a destination tile first
                    let destination = this.getTheFarthestDestinationTile(tile, vector, grid);

                    if (!State.cellsAreEquals(tile, destination)) {
                        let result: Tile;

                        // Move is available. Now need to check whether we'll just move or will merge
                        if (destination.value) {
                            Contract.assert(tile.value === destination.value, `Mergeable tile should have the same value as original tile! source.value: ${tile.value}, destination.value: ${destination.value}. destination.x: ${destination.x}, destination.y: ${destination.y}`);

                            // When merging destination cell could be a result of the move.
                            // in this case both cells should be store: original location of moved cell
                            // and the original location of the current cell.

                            result = State.Tile.mergeTiles(destination, tile.value * 2, tile, ...destination.origins);
                        } else {
                            // this is just a move
                            result = State.Tile.moveTile(destination.x, destination.y, tile.value, tile);
                        }

                        // 'Moving' tile to new destination
                        grid[destination.x][destination.y] = result;

                        // Cleaning up original tile
                        grid[tile.x][tile.y] = State.Tile.emptyTile(tile.x, tile.y);
                    }
                }
            });

            return grid;
        }

        private buildTraversals(direction: Direction): { x: number[], y: number[] } {
            let x: number[] = [];
            let y: number[] = [];

            for (var pos = 0; pos < this.size; pos++) {
                x.push(pos);
                y.push(pos);
            }
    
            // Always traverse from the farthest cell in the chosen direction.
            // I.e. from right to left for Right direction and from bottom to up for Down
            if (direction === Direction.Right) x = x.reverse();
            if (direction === Direction.Down) y = y.reverse();

            return { x: x, y: y };
        }

        private iterateOver(traversals: { x: number[], y: number[] }, callback: (x, y) => void): void {
            for (let x of traversals.x) {
                for (let y of traversals.y) {
                    callback(x, y);
                }
            }
        }
    }
}