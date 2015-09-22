/// <reference path="state.ts"/>
/// <reference path="Utils.ts"/>
/// <reference path="contract.ts"/>
var Model;
(function (Model) {
    var TileType = State.TileType;
    // Vectors representing tile movement
    var directionMap = {
        0: { dx: 0, dy: -1 },
        1: { dx: 1, dy: 0 },
        2: { dx: 0, dy: 1 },
        3: { dx: -1, dy: 0 } // Left
    };
    var Grid = (function () {
        function Grid(size, previousState) {
            this.size = size;
            this.cells = this.emptyGridOfValues(size);
        }
        //-----------------------------------------------------------------------------------------
        // Public Interface
        //-----------------------------------------------------------------------------------------
        // [pure] Returns true when cell is withing current grid size
        Grid.prototype.isInRange = function (cell) {
            Contract.requires(notNull(cell), 'cell should not be null or undefined');
            return (cell.x >= 0 && cell.x < this.size) && (cell.y >= 0 && cell.y < this.size);
        };
        /**
         * [pure] Returns value for specified cell.
         */
        Grid.prototype.valueAt = function (x, y) {
            Contract.requires(this.isInRange({ x: x, y: y }), 'x and y should be within bounds.');
            return this.cells[x][y];
        };
        /**
         * [pure] Returns true if psecified cell is occupied.
         */
        Grid.prototype.isOccupied = function (cell) {
            Contract.requires(this.isInRange(cell), 'cell should not be out of range');
            return !!this.valueAt(cell.x, cell.y);
        };
        /**
         * [pure] Returns true if the grid is full.
         */
        Grid.prototype.isFull = function () {
            return this.availableCells().length === 0;
        };
        /**
         * [pure] Returns state for current grid instance.
         */
        Grid.prototype.state = function () {
            var nonEmptyCells = [];
            this.eachCell(function (x, y, value) {
                if (value) {
                    nonEmptyCells.push({ x: x, y: y, value: value });
                }
            });
            return {
                size: this.size,
                cells: nonEmptyCells,
                stableCells: [this.stable].filter(function (f) { return notNull(f); })
            };
        };
        /**
         * [pure] Returns first random available cell.
         */
        Grid.prototype.randomAvailableCell = function () {
            Contract.requires(!this.isFull(), "Grid should not be full");
            var resultingCells = this.availableCells();
            // Don't need to check returned value length. Precondition should check this
            return resultingCells[Math.floor(Math.random() * resultingCells.length)];
        };
        /**
         * [not pure] Change cells internal state.
         */
        Grid.prototype.setValue = function (tile) {
            Contract.requires(!this.isFull(), "Grid should not be full");
            Contract.requires(!this.isOccupied(tile), 'Tile should not be occupied');
            Contract.requires(notNull(tile.value), 'value should not be null or undefined');
            this.cells[tile.x][tile.y] = tile.value;
        };
        Grid.prototype.addStableTile = function (x, y, value) {
            this.cells[x][y] = value;
            this.stable = { x: x, y: y, value: value };
        };
        /**
         * [not pure] Change the grid state by 'moving' all the tiles in specific direction.
         * Resulting list contains all non-empty tiles for the new state.
         */
        Grid.prototype.move = function (direction) {
            var _this = this;
            // This implementation is not very performant, but much more readable!
            // For grids with 4x4 this doesn't matter at all!
            var newGridState = this.doMove(direction);
            var stateCells = [];
            Utils.forEach(newGridState, function (x, y, tile) {
                Contract.assert(notNull(tile), 'All tiles in grid state should not be null or undefined');
                if (notNull(tile.value) && tile.type !== TileType.Empty) {
                    stateCells.push(tile);
                }
                // Applying new state to the grid instance.
                _this.cells[x][y] = tile.value;
            });
            return stateCells;
        };
        /**
         * [pure] Returns true if there is no moves for the grid.
         */
        Grid.prototype.hasMoves = function () {
            var _this = this;
            // Has moves if not full
            if (!this.isFull()) {
                return true;
            }
            // More complex scenario: trying to move each direction
            // and return true if at least one possible move is possible
            return [0 /* Up */, 1 /* Right */, 2 /* Down */, 3 /* Left */]
                .map(function (d) { return _this.tryMove(d); })
                .some(function (mr) { return mr.length !== 0; });
        };
        /**
         * [pure] Returns string represenation for the grid.
         */
        Grid.prototype.toString = function () {
            var result = "";
            // To get more appropriate view, need to print this stuff with per-column bases            
            for (var y = 0; y < this.size; y++) {
                var row = [];
                for (var x = 0; x < this.size; x++) {
                    row.push(this.cells[x][y]);
                }
                result += row.map(function (c) { return c ? c.toString() : " "; }).join(", ");
                result += "\r\n";
            }
            return result;
        };
        //----------------------------------------------------------------------------------
        // 'Private' methods
        //----------------------------------------------------------------------------------
        Grid.prototype.emptyGridOfValues = function (size) {
            var cells = new Array(size);
            for (var x = 0; x < size; x++) {
                cells[x] = new Array(size);
            }
            return cells;
        };
        // Creates grid of tiles based on current state
        Grid.prototype.newGridOfTiles = function () {
            var size = this.size;
            var cells = new Array(size);
            for (var x = 0; x < size; x++) {
                var row = new Array(size);
                for (var y = 0; y < size; y++) {
                    var tile = State.Tile.oldTile(x, y, this.cells[x][y]);
                    if (this.stable) {
                        if (this.stable.x === x && this.stable.y === y) {
                            tile = State.Tile.stableTile(x, y, this.stable.value);
                        }
                    }
                    row[y] = tile;
                }
                cells[x] = row;
            }
            return cells;
        };
        Grid.prototype.eachCell = function (callback) {
            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    callback(x, y, this.cells[x][y]);
                }
            }
        };
        Grid.prototype.availableCells = function () {
            var cells = new Array();
            this.eachCell(function (x, y, tile) {
                if (!tile) {
                    cells.push({ x: x, y: y });
                }
            });
            return cells;
        };
        Grid.prototype.tileFrom = function (x, y, grid) {
            if ((x >= 0 && x < this.size) && (y >= 0 && y < this.size)) {
                return grid[x][y];
            }
            return undefined;
        };
        /**
         * Returns farthest tile for specified tile.
         */
        Grid.prototype.getTheFarthestDestinationTile = function (tile, vector, grid) {
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
            var previousCandidate = tile;
            while (true) {
                // Progress towards the vector direction until mergeable candidate is found
                var candidate = this.tileFrom(previousCandidate.x + vector.dx, previousCandidate.y + vector.dy, grid);
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
        };
        Grid.prototype.tryMove = function (direction) {
            var stateCells = [];
            var newGridState = this.doMove(direction);
            Utils.forEach(newGridState, function (x, y, tile) {
                Contract.assert(notNull(tile), 'All tiles in grid state should not be null or undefined');
                if (tile.value && tile.type === TileType.Merged) {
                    stateCells.push(tile);
                }
            });
            return stateCells;
        };
        /**
         * [pure] Move tiles on the grid in the specified direction.
         */
        Grid.prototype.doMove = function (direction) {
            var _this = this;
            var grid = this.newGridOfTiles();
            //let grid = this.createGridState();
            var vector = directionMap[direction];
            var traversals = this.buildTraversals(direction);
            // Traverse the grid in the right direction and move tiles
            this.iterateOver(traversals, function (x, y) {
                var tile = _this.tileFrom(x, y, grid);
                // Only non-empty tiles could change the location during the move
                if (tile.value && !tile.isStable) {
                    // Looking for a destination tile first
                    var destination = _this.getTheFarthestDestinationTile(tile, vector, grid);
                    if (!State.cellsAreEquals(tile, destination)) {
                        var result;
                        // Move is available. Now need to check whether we'll just move or will merge
                        if (destination.value) {
                            Contract.assert(tile.value === destination.value, "Mergeable tile should have the same value as original tile! source.value: " + tile.value + ", destination.value: " + destination.value + ". destination.x: " + destination.x + ", destination.y: " + destination.y);
                            // When merging destination cell could be a result of the move.
                            // in this case both cells should be store: original location of moved cell
                            // and the original location of the current cell.
                            // TODO: all this stable propagation is a bit silly!!
                            result = (_a = State.Tile).mergeTiles.apply(_a, [destination, tile.value * 2, destination.isStable, tile].concat(destination.origins));
                        }
                        else {
                            // this is just a move
                            result = State.Tile.moveTile(destination.x, destination.y, tile.value, tile);
                        }
                        // 'Moving' tile to new destination
                        grid[destination.x][destination.y] = result;
                        // Cleaning up original tile
                        grid[tile.x][tile.y] = State.Tile.emptyTile(tile.x, tile.y);
                    }
                }
                var _a;
            });
            return grid;
        };
        Grid.prototype.buildTraversals = function (direction) {
            var x = [];
            var y = [];
            for (var pos = 0; pos < this.size; pos++) {
                x.push(pos);
                y.push(pos);
            }
            // Always traverse from the farthest cell in the chosen direction.
            // I.e. from right to left for Right direction and from bottom to up for Down
            if (direction === 1 /* Right */)
                x = x.reverse();
            if (direction === 2 /* Down */)
                y = y.reverse();
            return { x: x, y: y };
        };
        Grid.prototype.iterateOver = function (traversals, callback) {
            for (var _i = 0, _a = traversals.x; _i < _a.length; _i++) {
                var x = _a[_i];
                for (var _b = 0, _c = traversals.y; _b < _c.length; _b++) {
                    var y = _c[_b];
                    callback(x, y);
                }
            }
        };
        return Grid;
    })();
    Model.Grid = Grid;
})(Model || (Model = {}));
//# sourceMappingURL=grid.js.map