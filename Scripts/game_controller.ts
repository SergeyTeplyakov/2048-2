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
    import TileState = State.TileState;

    interface AdvancedMode {
        stableTiles: TileState[];
        level: number;
    }

    /**
     * High-level game controller that works like a mediator in the game.
     * 
     * Currently game has two modes: regular game mode and advanced mode.
     * With advanced mode there is a stable cell and player will win only when 
     * it kill stable cell.
     */
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

        private advanced: AdvancedMode;
        private get isAdvanced(): boolean { return !!this.advanced; }

        constructor(size: number, advancedMode: boolean, keyboard?: Keyboard.KeyboardListener, view?: View.HtmlView) {
            this.size = size;

            // For JS newby: bind is super critical, because 'this' in callbacks would be equal to 
            // sender, not to the receiver!
            this.keyboard = keyboard || Keyboard.createKeyboard();
            this.keyboard.subscribe(this.handleInput.bind(this));

            this.storage = new Store.ContentStorage("2048++");

            this.view = view || View.createView();
            
            this.setup(advancedMode);
        }

        private handleInput(event: Keyboard.InputEvent) {
            // Poor's man pattern matching!

            if (event instanceof Keyboard.Move) {
                if (this.status === GameStatus.KeepPlaying) {
                    // Don't know why, but the cast is required!
                    this.move((<Keyboard.Move>event).direction);
                }
            } else if (event instanceof Keyboard.Restart) {
                this.restartTheGame();
            } else if (event instanceof Keyboard.NextLevel) {
                this.nextLevel();
            } else if (event instanceof Keyboard.EnterPress) {
                if (this.won) this.nextLevel();
            }
        }

        private setup(advancedMode: boolean) {
            // cleaning up the winning flag!
            this.won = false;
            this.score = 0;
            this.status = GameStatus.KeepPlaying;

            let previousState = this.storage.getGameState();

            this.grid = new Model.GridController(this.size, previousState && previousState.grid);

            // With advanced mode everything is a bit more complicated.
            // If previous state is empty then the level is 1 and stable value is 2.
            // Otherwise stable value should be increased (multiplied by 2).
            let tiles: Tile[] = [];

            if (advancedMode) {
                tiles.push(...this.initAdvancedMode(this.storage.getCurrentLevel(), previousState));
            } else {
                tiles.push(...this.initRegularMode(previousState));
            }

            // Update the view
            this.actuate(tiles);
        }

        private initRegularMode(previousState?: GameState): Tile[] {
            if (previousState) {
                let tiles: Tile[] = [];
                // Need to restore old state
                previousState.grid.cells.forEach(t => {
                    tiles.push(Tile.oldTile(t.x, t.y, t.value));
                });

                return tiles;
            }

            return this.grid.addRandomTiles(startTilesCount);
        }

        private initAdvancedMode(level: number, previousState?: GameState): Tile[] {
            let stableTiles: TileState[] = [];
            let tiles: Tile[] = [];

            if (previousState) {
                // Need to restore old state
                previousState.grid.cells.forEach(t => {
                    tiles.push(Tile.oldTile(t.x, t.y, t.value));
                });

                previousState.grid.stableCells.forEach(t => {
                    tiles.push(Tile.stableTile(t.x, t.y, t.value));
                });

                stableTiles.push(...previousState.grid.stableCells);
            } else {
                let value = getLevelTargetTile(level); // level 1 -> 2, level 2 -> 4 etc

                tiles.push(...this.grid.addRandomTiles(startTilesCount - stableTilesCount));
                let stable = this.grid.addRandomStableTiles(stableTilesCount, value);
                stableTiles = stable;

                tiles.push(...stable);
            }

            // TODO: design is bad! Timing issue between initAdvancedMode method call and setup method call
            this.advanced = {
                stableTiles: stableTiles,
                level: level
            };

            return tiles;

        }

        // Sends the updated grid to the actuator    
        private actuate(tiles: Tile[]) {
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
            } else {
                this.storage.updateGameState(this.computeGameState());
            }

            this.view.updateView(this.advanced.level, tiles, this.score, this.bestScore, this.status);
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
            this.setup(this.isAdvanced);
        }

        // Keep playing after winning (allows going over 2048)
        private nextLevel() {
            Contract.assert(this.status !== GameStatus.GameOver, "Can't continue game when the game was over");

            //this.status = GameStatus.KeepPlaying;
            //this.view.clearMessage(); // Clear the game won/lost message
            this.advanced.level++;
            this.storage.saveCurrentLevel(this.advanced.level);
            this.restartTheGame();
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
                // Victory ckeck is also more complicated for advanced mode
                if (this.isAdvanced) {
                    let victory = moves.some(t => t.isStable && t.type === State.TileType.Merged);

                    if (!this.won && victory) {
                        this.status = GameStatus.Victory;
                        this.won = true;
                    }
                } else {
                    if (!this.won && Tile.hasTileWithValue(moves, gameMaxValue)) {
                        this.status = GameStatus.Victory;
                        this.won = true;
                    }
                }
            }

            this.actuate(moves);
        }

        private checkVictory(moves: Tile[]) {
            
        }
    }
}