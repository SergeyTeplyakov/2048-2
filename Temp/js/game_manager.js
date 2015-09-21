/// <reference path="tile.ts" />
/// <reference path="grid.ts" />
/// <reference path="local_storage_manager.ts" />
/// <reference path="keyboard_input_manager.ts" />
/// <reference path="html_actuator.ts" />
var gameMaxValue = 2048;
var startTilesCount = 2;
// Vectors representing tile movement
var directionMap = {
    0: { x: 0, y: -1 },
    1: { x: 1, y: 0 },
    2: { x: 0, y: 1 },
    3: { x: -1, y: 0 } // Left
};
var vectors = [
    directionMap[0 /* Up */],
    directionMap[1 /* Right */],
    directionMap[2 /* Down */],
    directionMap[3 /* Left */],
];
// // Get the vector representing the chosen direction
// function getVector(direction: Direction): Vector {
//         return map[direction];
// };
var GameManager = (function () {
    function GameManager(size) {
        this.size = size;
        // For JS newby: bind is super critical, because 'this' in callbacks would be equal to sender, not to the receiver!
        this.inputManager = new TsKeyboardInputManager(this.handleInput.bind(this));
        this.actuator = new HtmlActuator();
        this.storageManager = new LocalStorageManager();
        this.setup();
    }
    GameManager.prototype.handleInput = function (event) {
        // Poor's man pattern matching!
        // TODO: can't find out how to use the same stuff without classes!!
        if (event instanceof Move) {
            this.move(event.direction);
        }
        else if (event instanceof Restart) {
            this.restart();
        }
        else if (event instanceof KeepPlaying) {
            this.keepPlayingFunc();
        }
    };
    GameManager.prototype.setup = function () {
        var previousState = this.storageManager.getGameState();
        // Reload the game from a previous game if present
        if (previousState) {
            this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.keepPlaying = previousState.keepPlaying;
        }
        else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.keepPlaying = false;
            // Add the initial tiles
            this.addStartTiles();
        }
        // Update the actuator
        this.actuate();
    };
    // Set up the initial tiles to start the game with
    GameManager.prototype.addStartTiles = function () {
        for (var i = 0; i < startTilesCount; i++) {
            this.addRandomTile();
        }
    };
    // Adds a tile in a random position
    GameManager.prototype.addRandomTile = function () {
        // but cells should be availbe right now! Otherwise this is a bug!
        if (this.grid.cellsAvailable()) {
            var tile = new Tiles.Tile(this.grid.randomAvailableCell(), getRandomTileValue());
            this.grid.insertTile(tile);
        }
    };
    // Sends the updated grid to the actuator    
    GameManager.prototype.actuate = function () {
        this.storageManager.updateBestScoreIfNeeded(this.score);
        // Clear the state when the game is over (game over only, not win)
        if (this.over) {
            this.storageManager.clearGameState();
        }
        else {
            this.storageManager.setGameState(this.serialize());
        }
        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated()
        });
    };
    // Restart the game
    GameManager.prototype.restart = function () {
        this.storageManager.clearGameState();
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    };
    // Keep playing after winning (allows going over 2048)
    GameManager.prototype.keepPlayingFunc = function () {
        this.keepPlaying = true;
        this.actuator.continueGame(); // Clear the game won/lost message
    };
    GameManager.prototype.isGameTerminated = function () {
        return this.over || (this.won && !this.keepPlaying);
    };
    GameManager.prototype.serialize = function () {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
            keepPlaying: this.keepPlaying
        };
    };
    // Save all tile positions and remove merger info
    GameManager.prototype.prepareTiles = function () {
        this.grid.eachCell(function (x, y, tile) {
            if (tile) {
                // tile.mergedFrom = null;
                tile.saveCurrentPositionAsPrevious();
            }
        });
    };
    // Move a tile and its representation
    GameManager.prototype.moveTile = function (tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    };
    // Move tiles on the grid in the specified direction
    GameManager.prototype.move = function (direction) {
        // 0: up, 1: right, 2: down, 3: left
        var self = this;
        if (this.isGameTerminated())
            return; // Don't do anything if the game's over
        // var cell, tile;
        var vector = directionMap[direction];
        var traversals = this.buildTraversals(vector);
        var moved = false;
        // Save the current tile positions and remove merger information
        this.prepareTiles();
        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
                var cell = { x: x, y: y };
                var tile = self.grid.cellContent(cell);
                if (tile) {
                    var positions = self.findFarthestPosition(cell, vector);
                    var next = self.grid.cellContent(positions.next);
                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        var merged = new Tiles.Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];
                        self.grid.insertTile(merged);
                        self.grid.removeTile(tile);
                        // Converge the two tiles' positions
                        tile.updatePosition(positions.next);
                        // Update the score
                        self.score += merged.getValue();
                        // The mighty 2048 tile
                        if (merged.getValue() === gameMaxValue)
                            self.won = true;
                    }
                    else {
                        self.moveTile(tile, positions.farthest);
                    }
                    if (!positionsEqual(cell, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            });
        });
        if (moved) {
            this.addRandomTile();
            if (!this.movesAvailable()) {
                this.over = true; // Game over!
            }
            this.actuate();
        }
    };
    // // Get the vector representing the chosen direction
    // getVector(direction): TilePosition {
    //     // Vectors representing tile movement
    //     var map = {
    //         0: { x: 0, y: -1 }, // Up
    //         1: { x: 1, y: 0 },  // Right
    //         2: { x: 0, y: 1 },  // Down
    //         3: { x: -1, y: 0 }   // Left
    //     };
    // 
    //     return map[direction];
    // };
    // Build a list of positions to traverse in the right order
    // TODO: name is weird in this case, because this guy is not a position!
    GameManager.prototype.buildTraversals = function (vector) {
        var traversals = { x: Array(), y: Array() };
        for (var pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1)
            traversals.x = traversals.x.reverse();
        if (vector.y === 1)
            traversals.y = traversals.y.reverse();
        return traversals;
    };
    GameManager.prototype.findFarthestPosition = function (cell, vector) {
        var previous;
        // Progress towards the vector direction until an obstacle is found
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) &&
            this.grid.cellAvailable(cell));
        return {
            farthest: previous,
            next: cell // Used to check if a merge is required
        };
    };
    GameManager.prototype.movesAvailable = function () {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    };
    // Check for available matches between tiles (more expensive check)
    GameManager.prototype.tileMatchesAvailable = function () {
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                // TODO: functional approach should be used!
                // grid could have a method that return a sequence of tiles!
                var tile = this.grid.cellContent({ x: x, y: y });
                if (tile) {
                    for (var _i = 0; _i < vectors.length; _i++) {
                        var vector = vectors[_i];
                        var cell = { x: x + vector.x, y: y + vector.y };
                        var other = this.grid.cellContent(cell);
                        if (other && other.value === tile.value) {
                            return true; // These two tiles can be merged
                        }
                    }
                }
            }
        }
        return false;
    };
    return GameManager;
})();
function getRandomTileValue() {
    return Math.random() < 0.9 ? 2 : 4;
}
function positionsEqual(left, right) {
    return left.x === right.x && left.y === right.y;
}
//# sourceMappingURL=game_manager.js.map