/// <reference path="globals.ts"/>
/// <reference path="grid.ts"/>
var Model;
(function (Model) {
    var Tile = State.Tile;
    /**
     * Simple wrapper on top of the Grid class that adds random tiles after each move.
     *
     */
    var GridController = (function () {
        function GridController(size, previousState) {
            this.size = size;
            this.grid = new Model.Grid(size);
            if (previousState) {
                this.applyGridChanges(previousState);
            }
        }
        //----------------------------------------------------------------------------
        // Public interface
        //----------------------------------------------------------------------------
        GridController.prototype.addRandomTiles = function (count) {
            var result = [];
            for (var i = 0; i < count; i++) {
                var cell = this.grid.randomAvailableCell();
                var value = getRandomTileValue();
                this.grid.setValue({ x: cell.x, y: cell.y, value: value });
                result.push(Tile.newTile(cell.x, cell.y, value));
            }
            return result;
        };
        GridController.prototype.move = function (direction) {
            return this.grid.move(direction);
        };
        GridController.prototype.hasMoves = function () {
            return this.grid.hasMoves();
        };
        GridController.prototype.state = function () {
            return this.grid.state();
        };
        GridController.prototype.isFull = function () {
            return this.grid.isFull();
        };
        //----------------------------------------------------------------------------
        // Implementation
        //----------------------------------------------------------------------------
        GridController.prototype.applyGridChanges = function (tiles) {
            for (var _i = 0; _i < tiles.length; _i++) {
                var tile = tiles[_i];
                Contract.assert(this.grid.isInRange(tile), 'tile should be withing grid range');
                Contract.assert(notNull(tile.value), 'tile.value should not be null or undefined');
                this.grid.setValue(tile);
            }
        };
        return GridController;
    })();
    Model.GridController = GridController;
})(Model || (Model = {}));
//# sourceMappingURL=grid_controller.js.map