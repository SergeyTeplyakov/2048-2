/// <reference path="state.ts"/>
/// <reference path="contract.ts"/>
///// <reference path="contract.ts"/>
var GridControl;
(function (GridControl) {
    (function (Direction) {
        Direction[Direction["Up"] = 0] = "Up";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Down"] = 2] = "Down";
        Direction[Direction["Left"] = 3] = "Left";
    })(GridControl.Direction || (GridControl.Direction = {}));
    var Direction = GridControl.Direction;
    function createGrid(size, previousState) {
        var cells = empty(size);
        if (previousState) {
            fillGrid(previousState);
        }
        //----------------------------------------------------------------------------------
        // Grid implementation methods
        //----------------------------------------------------------------------------------
        function isOccupied(cell) {
            return false;
        }
        function isFull() {
            return false;
        }
        function randomAvailableCell() {
            Contract.requires(!isFull(), "Grid should not be full");
            return null;
        }
        function addTile(tile) {
            Contract.requires(!isFull(), "Grid should not be full");
        }
        function move(direction) {
            Contract.requires(!isFull(), "Grid should not be full");
            return undefined;
        }
        //----------------------------------------------------------------------------------
        // 'Private' methods
        //----------------------------------------------------------------------------------
        function empty(size) {
            var cells = new Array(size);
            for (var x = 0; x < size; x++) {
                cells[x] = new Array(size);
            }
            return cells;
        }
        function fillGrid(tiles) {
            for (var _i = 0; _i < tiles.length; _i++) {
                var tile = tiles[_i];
                //Contract.assert(tile.)
                //withinBounds(tile);
                Contract.assert(notNull(tile.value), 'tile.value should not be null or undefined');
                cells[tile.x][tile.y] = tile.value;
            }
        }
        return cells;
    }
    GridControl.createGrid = createGrid;
})(GridControl || (GridControl = {}));
var GridClass = (function () {
    function GridClass(size, previousState) {
        this.size = size;
        this.cells = previousState ? Grid.fromState(size, previousState) : Grid.empty(size);
    }
    GridClass.fromState = function (size, state) {
        var cells = new Array(size);
        for (var x = 0; x < size; x++) {
            var row = cells[x] = new Array(size);
            for (var y = 0; y < size; y++) {
                // TODO: it seems that this is a bug, if state[x][y] is null! Right?
                var tile = state[x][y];
                row[y] = tile && new Tile(tile.position, tile.value);
            }
        }
        return cells;
    };
    GridClass.empty = function (size) {
        var cells = new Array(size);
        for (var x = 0; x < size; x++) {
            cells[x] = new Array(size);
        }
        return cells;
    };
    // Find the first available random position
    GridClass.prototype.randomAvailableCell = function () {
        var cells = this.availableCells();
        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
        return null;
    };
    ;
    // Check if there are any cells available
    GridClass.prototype.cellsAvailable = function () {
        return !!this.availableCells().length;
    };
    // Call callback for every cell  
    GridClass.prototype.eachCell = function (callback) {
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }
    };
    GridClass.prototype.availableCells = function () {
        var cells = new Array();
        this.eachCell(function (x, y, tile) {
            if (!tile) {
                cells.push({ x: x, y: y });
            }
        });
        return cells;
    };
    // Check if the specified cell is taken
    GridClass.prototype.cellAvailable = function (cell) {
        return !this.cellOccupied(cell);
    };
    GridClass.prototype.cellOccupied = function (cell) {
        // TODO: is this the same as cellContent(cell) != null? I dont think that it could be undefined!
        // TODO: this stuff hids potential bugs and returns null if cell is invalid!
        return !!this.cellContent(cell);
    };
    GridClass.prototype.cellContent = function (cell) {
        // TODO: not sure why this required!! This is a bug if the cell is out of bounds!
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        }
        return null;
    };
    // Inserts a tile at its position
    GridClass.prototype.insertTile = function (tile) {
        this.cells[tile.x][tile.y] = tile;
    };
    GridClass.prototype.removeTile = function (tile) {
        this.cells[tile.x][tile.y] = null;
    };
    ;
    // TODO: why the hell this is reauired!! This is a bug if this returns false!!!
    GridClass.prototype.withinBounds = function (position) {
        return position.x >= 0 && position.x < this.size &&
            position.y >= 0 && position.y < this.size;
    };
    GridClass.prototype.serialize = function () {
        var cellState = new Array(this.size);
        for (var x = 0; x < this.size; x++) {
            var row = cellState[x] = [];
            for (var y = 0; y < this.size; y++) {
                row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }
        }
        return {
            size: this.size,
            cells: cellState
        };
    };
    return GridClass;
})();
exports.GridClass = GridClass;
//# sourceMappingURL=game_grid.js.map