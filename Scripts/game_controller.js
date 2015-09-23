/// <reference path="globals.ts" />
/// <reference path="state.ts" />
/// <reference path="grid_controller.ts" />
/// <reference path="content_storage.ts" />
/// <reference path="keyboard_listener.ts" />
/// <reference path="html_view.ts" />
var Control;
(function (Control) {
    var Tile = State.Tile;
    var GameStatus = State.GameStatus;
    /**
     * High-level game controller that works like a mediator in the game.
     *
     * Currently game has two modes: regular game mode and advanced mode.
     * With advanced mode there is a stable cell and player will win only when
     * it kill stable cell.
     */
    var GameController = (function () {
        function GameController(size, advancedMode, keyboard, view) {
            this.size = size;
            // For JS newby: bind is super critical, because 'this' in callbacks would be equal to 
            // sender, not to the receiver!
            this.keyboard = keyboard || Keyboard.createKeyboard();
            this.keyboard.subscribe(this.handleInput.bind(this));
            this.storage = new Store.ContentStorage("2048++");
            this.view = view || View.createView();
            this.setup(advancedMode);
        }
        Object.defineProperty(GameController.prototype, "isAdvanced", {
            get: function () { return !!this.advanced; },
            enumerable: true,
            configurable: true
        });
        GameController.prototype.handleInput = function (event) {
            // Poor's man pattern matching!
            if (event instanceof Keyboard.Move) {
                if (this.status === GameStatus.KeepPlaying) {
                    // Don't know why, but the cast is required!
                    this.move(event.direction);
                }
            }
            else if (event instanceof Keyboard.Restart) {
                this.restartTheGame();
            }
            else if (event instanceof Keyboard.NextLevel) {
                this.nextLevel();
            }
            else if (event instanceof Keyboard.EnterPress) {
                if (this.won)
                    this.nextLevel();
            }
        };
        GameController.prototype.setup = function (advancedMode) {
            // cleaning up the winning flag!
            this.won = false;
            this.score = 0;
            this.status = GameStatus.KeepPlaying;
            var previousState = this.storage.getGameState();
            this.grid = new Model.GridController(this.size, previousState && previousState.grid);
            // With advanced mode everything is a bit more complicated.
            // If previous state is empty then the level is 1 and stable value is 2.
            // Otherwise stable value should be increased (multiplied by 2).
            var tiles = [];
            if (advancedMode) {
                tiles.push.apply(tiles, this.initAdvancedMode(this.storage.getCurrentLevel(), previousState));
            }
            else {
                tiles.push.apply(tiles, this.initRegularMode(previousState));
            }
            // Update the view
            this.actuate(tiles);
        };
        GameController.prototype.initRegularMode = function (previousState) {
            if (previousState) {
                var tiles = [];
                // Need to restore old state
                previousState.grid.cells.forEach(function (t) {
                    tiles.push(Tile.oldTile(t.x, t.y, t.value));
                });
                return tiles;
            }
            return this.grid.addRandomTiles(startTilesCount);
        };
        GameController.prototype.initAdvancedMode = function (level, previousState) {
            var stableTiles = [];
            var tiles = [];
            if (previousState) {
                // Need to restore old state
                previousState.grid.cells.forEach(function (t) {
                    tiles.push(Tile.oldTile(t.x, t.y, t.value));
                });
                previousState.grid.stableCells.forEach(function (t) {
                    tiles.push(Tile.stableTile(t.x, t.y, t.value));
                });
                stableTiles.push.apply(stableTiles, previousState.grid.stableCells);
            }
            else {
                var value = getLevelTargetTile(level); // level 1 -> 2, level 2 -> 4 etc
                tiles.push.apply(tiles, this.grid.addRandomTiles(startTilesCount - stableTilesCount));
                var stable = this.grid.addRandomStableTiles(stableTilesCount, value);
                stableTiles = stable;
                tiles.push.apply(tiles, stable);
            }
            // TODO: design is bad! Timing issue between initAdvancedMode method call and setup method call
            this.advanced = {
                stableTiles: stableTiles,
                level: level
            };
            return tiles;
        };
        // Sends the updated grid to the actuator    
        GameController.prototype.actuate = function (tiles) {
            this.score += Tile.computeScore(tiles);
            this.storage.updateBestScoreIfNeeded(this.score);
            if (this.advanced && this.status === GameStatus.Victory) {
                // TODO: level should be increased only when the new game button was pressed
                //this.advanced.level++;
                this.storage.saveCurrentLevel(this.advanced.level);
            }
            if (this.status === GameStatus.GameOver) {
                // Clear the state when the game is over (game over only, not win)
                this.storage.clearGameState();
            }
            else {
                this.storage.updateGameState(this.computeGameState());
            }
            this.view.updateView(this.advanced.level, tiles, this.score, this.bestScore, this.status);
        };
        Object.defineProperty(GameController.prototype, "bestScore", {
            get: function () {
                return this.storage.getBestScore();
            },
            enumerable: true,
            configurable: true
        });
        GameController.prototype.computeGameState = function () {
            return {
                score: this.score,
                status: this.status,
                grid: this.grid.state()
            };
        };
        GameController.prototype.restartTheGame = function () {
            this.storage.clearGameState();
            this.view.clearMessage(); // Clear the game won/lost message
            this.setup(this.isAdvanced);
        };
        // Keep playing after winning (allows going over 2048)
        GameController.prototype.nextLevel = function () {
            Contract.assert(this.status !== GameStatus.GameOver, "Can't continue game when the game was over");
            //this.status = GameStatus.KeepPlaying;
            //this.view.clearMessage(); // Clear the game won/lost message
            this.advanced.level++;
            this.storage.saveCurrentLevel(this.advanced.level);
            this.restartTheGame();
        };
        // Move tiles on the grid in the specified direction
        GameController.prototype.move = function (direction) {
            var moves = this.grid.move(direction);
            // nothing to do, player selected wrong direction!
            var hasMoves = Tile.hasMovesOrMerges(moves);
            if (!hasMoves) {
                return;
            }
            // Adding new tiles to moves list
            moves.push.apply(moves, this.grid.addRandomTiles(moveTilesCount));
            // check that moves are available
            if (!this.grid.hasMoves()) {
                this.status = GameStatus.GameOver;
            }
            else {
                // Victory ckeck is also more complicated for advanced mode
                if (this.isAdvanced) {
                    var victory = moves.some(function (t) { return t.isStable && t.type === State.TileType.Merged; });
                    if (!this.won && victory) {
                        this.status = GameStatus.Victory;
                        this.won = true;
                    }
                }
                else {
                    if (!this.won && Tile.hasTileWithValue(moves, gameMaxValue)) {
                        this.status = GameStatus.Victory;
                        this.won = true;
                    }
                }
            }
            this.actuate(moves);
        };
        GameController.prototype.checkVictory = function (moves) {
        };
        return GameController;
    })();
    Control.GameController = GameController;
})(Control || (Control = {}));
//# sourceMappingURL=game_controller.js.map