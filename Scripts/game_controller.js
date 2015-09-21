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
    var GameController = (function () {
        function GameController(size, keyboard, view) {
            this.size = size;
            // For JS newby: bind is super critical, because 'this' in callbacks would be equal to 
            // sender, not to the receiver!
            this.keyboard = keyboard || Keyboard.createKeyboard();
            this.keyboard.subscribe(this.handleInput.bind(this));
            this.storage = new Store.ContentStorage("2048#");
            this.view = view || View.createView();
            this.setup();
        }
        GameController.prototype.handleInput = function (event) {
            // Poor's man pattern matching!
            if (event instanceof Keyboard.Move) {
                // Don't know why, but the cast is required!
                this.move(event.direction);
            }
            else if (event instanceof Keyboard.Restart) {
                this.restartTheGame();
            }
            else if (event instanceof Keyboard.KeepPlaying) {
                this.keepPlaying();
            }
        };
        GameController.prototype.setup = function () {
            // cleaning up the winning flag!
            this.won = false;
            this.score = 0;
            this.status = GameStatus.KeepPlaying;
            var previousState = this.storage.getGameState();
            this.grid = new Model.GridController(this.size, previousState && previousState.grid.cells);
            var tiles = [];
            if (previousState) {
                // Need to restore old state
                previousState.grid.cells.forEach(function (t) {
                    tiles.push(Tile.oldTile(t.x, t.y, t.value));
                });
            }
            else {
                tiles = this.grid.addRandomTiles(startTilesCount);
            }
            // Update the view
            this.actuate(tiles);
        };
        // Sends the updated grid to the actuator    
        GameController.prototype.actuate = function (tiles) {
            this.score += Tile.computeScore(tiles);
            this.storage.updateBestScoreIfNeeded(this.score);
            if (this.status === GameStatus.GameOver) {
                // Clear the state when the game is over (game over only, not win)
                this.storage.clearGameState();
            }
            else {
                this.storage.updateGameState(this.computeGameState());
            }
            this.view.updateView(tiles, this.score, this.bestScore, this.status);
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
            this.setup();
        };
        // Keep playing after winning (allows going over 2048)
        GameController.prototype.keepPlaying = function () {
            Contract.assert(this.status !== GameStatus.GameOver, "Can't continue game when the game was over");
            this.status = GameStatus.KeepPlaying;
            this.view.clearMessage(); // Clear the game won/lost message
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
                if (!this.won && Tile.hasTileWithValue(moves, gameMaxValue)) {
                    this.status = GameStatus.Victory;
                    this.won = true;
                }
            }
            this.actuate(moves);
        };
        return GameController;
    })();
    Control.GameController = GameController;
})(Control || (Control = {}));
//# sourceMappingURL=game_controller.js.map