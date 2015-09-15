/// <reference path="tile.ts"/>
var Grid = (function () {
    function Grid(size, previousState) {
        this.size = size;
        this.cells = previousState ? Grid.fromState(size, previousState) : Grid.empty(size);
    }
    Grid.fromState = function (size, state) {
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
    Grid.empty = function (size) {
        var cells = new Array(size);
        for (var x = 0; x < size; x++) {
            cells[x] = new Array(size);
        }
        return cells;
    };
    // Find the first available random position
    Grid.prototype.randomAvailableCell = function () {
        var cells = this.availableCells();
        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
        return null;
    };
    ;
    // Check if there are any cells available
    Grid.prototype.cellsAvailable = function () {
        return !!this.availableCells().length;
    };
    // Call callback for every cell  
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
    // Check if the specified cell is taken
    Grid.prototype.cellAvailable = function (cell) {
        return !this.cellOccupied(cell);
    };
    Grid.prototype.cellOccupied = function (cell) {
        // TODO: is this the same as cellContent(cell) != null? I dont think that it could be undefined!
        // TODO: this stuff hids potential bugs and returns null if cell is invalid!
        return !!this.cellContent(cell);
    };
    Grid.prototype.cellContent = function (cell) {
        // TODO: not sure why this required!! This is a bug if the cell is out of bounds!
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        }
        return null;
    };
    // Inserts a tile at its position
    Grid.prototype.insertTile = function (tile) {
        this.cells[tile.x][tile.y] = tile;
    };
    Grid.prototype.removeTile = function (tile) {
        this.cells[tile.x][tile.y] = null;
    };
    ;
    // TODO: why the hell this is reauired!! This is a bug if this returns false!!!
    Grid.prototype.withinBounds = function (position) {
        return position.x >= 0 && position.x < this.size &&
            position.y >= 0 && position.y < this.size;
    };
    Grid.prototype.serialize = function () {
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
    return Grid;
})();
//# sourceMappingURL=grid.js.map