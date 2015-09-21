/// <reference path="globals.ts" />
/// <reference path="state.ts" />
/// <reference path="grid_controller.ts" />
/// <reference path="content_storage.ts" />
/// <reference path="keyboard_listener.ts" />
/// <reference path="html_view.ts" />

module Control {

    import Tile = State.Tile;
    import GameStatus = State.GameStatus;
    import GameState = State.GameState;
    import Direction = State.Direction;

    export class GameController {
        private size: number;

        private grid: Model.GridController;
        private keyboard: Keyboard.KeyboardListener;
        private storage: Store.ContentStorage;
        private view: View.HtmlView;

        private score: number;
        private status: GameStatus;

        // need to capture victory state to show congrats to the user only once.
        private won: boolean;

        constructor(size: number, keyboard?: Keyboard.KeyboardListener, view?: View.HtmlView) {
            this.size = size;

            // For JS newby: bind is super critical, because 'this' in callbacks would be equal to 
            // sender, not to the receiver!
            this.keyboard = keyboard || Keyboard.createKeyboard();
            this.keyboard.subscribe(this.handleInput.bind(this));

            this.storage = new Store.ContentStorage("2048#");

            this.view = view || View.createView();
            
            this.setup();
        }

        private handleInput(event: Keyboard.InputEvent) {
            // Poor's man pattern matching!

            if (event instanceof Keyboard.Move) {
                // Don't know why, but the cast is required!
                this.move((<Keyboard.Move>event).direction);
            } else if (event instanceof Keyboard.Restart) {
                this.restartTheGame();
            } else if (event instanceof Keyboard.KeepPlaying) {
                this.keepPlaying();
            }
        }

        private setup() {
            // cleaning up the winning flag!
            this.won = false;
            this.score = 0;
            this.status = GameStatus.KeepPlaying;

            let previousState = this.storage.getGameState();
            this.grid = new Model.GridController(this.size, previousState && previousState.grid.cells);

            let tiles: Tile[] = [];
            if (previousState) {
                // Need to restore old state
                previousState.grid.cells.forEach(t => {
                    tiles.push(Tile.oldTile(t.x, t.y, t.value));
                });

            } else {
                tiles = this.grid.addRandomTiles(startTilesCount);
            }

            // Update the view
            this.actuate(tiles);
        }

        // Sends the updated grid to the actuator    
        private actuate(tiles: Tile[]) {
            this.score += Tile.computeScore(tiles);

            this.storage.updateBestScoreIfNeeded(this.score);

            if (this.status === GameStatus.GameOver) {
                // Clear the state when the game is over (game over only, not win)
                this.storage.clearGameState();
            } else {
                this.storage.updateGameState(this.computeGameState());
            }

            this.view.updateView(tiles, this.score, this.bestScore, this.status);
        }

        private get bestScore(): number {
            return this.storage.getBestScore();
        }

        private computeGameState(): GameState
        {
            return {
                score: this.score,
                status: this.status,
                grid: this.grid.state()
            }
        }

        private restartTheGame() {
            this.storage.clearGameState();
            this.view.clearMessage(); // Clear the game won/lost message
            this.setup();
        }

        // Keep playing after winning (allows going over 2048)
        private keepPlaying() {
            Contract.assert(this.status !== GameStatus.GameOver, "Can't continue game when the game was over");

            this.status = GameStatus.KeepPlaying;
            this.view.clearMessage(); // Clear the game won/lost message
        }

        // Move tiles on the grid in the specified direction
        private move(direction: Direction) {
            let moves = this.grid.move(direction);

            // nothing to do, player selected wrong direction!
            let hasMoves = Tile.hasMovesOrMerges(moves);
            if (!hasMoves) {
                return;
            }

            // Adding new tiles to moves list
            moves.push(...this.grid.addRandomTiles(moveTilesCount));

            // check that moves are available
            if (!this.grid.hasMoves()) {
                this.status = GameStatus.GameOver;
            } else {
                if (!this.won && Tile.hasTileWithValue(moves, gameMaxValue)) {
                    this.status = GameStatus.Victory;
                    this.won = true;
                }
            }

            this.actuate(moves);
        }
    }
}