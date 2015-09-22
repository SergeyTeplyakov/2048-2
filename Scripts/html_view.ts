/// <reference path="globals.ts"/>
/// <reference path="state.ts"/>
/// <reference path="grid.ts"/>

module View {
    import GameState = State.GameState;
    import GameStatus = State.GameStatus;

    export interface HtmlView {
        updateView(tiles: State.Tile[], score: number, bestScore: number, status: State.GameStatus): void;
        //updateScore(score: number): void;
        //updateBestScore(bestScore: number): void;
        clearMessage(): void;
        addTile(tile: State.Tile): void;
        clearContainer(container): void;
    }

    export function createView(): HtmlView {
        return new HtmlViewImpl();
    }

    class HtmlViewImpl implements HtmlView {
        private tileContainer: Element;
        private scoreContainer: Element;
        private bestContainer: Element;
        private messageContainer: Element;

        private score: number;

        constructor() {
            this.tileContainer = document.querySelector(".tile-container");
            this.scoreContainer = document.querySelector(".score-container");
            this.bestContainer = document.querySelector(".best-container");
            this.messageContainer = document.querySelector(".game-message");

            this.score = 0;
        }

        public updateView(tiles: State.Tile[], score: number, bestScore: number, status: State.GameStatus) {
            window.requestAnimationFrame(() => {
                this.clearContainer(this.tileContainer);


                tiles.forEach(tile => {
                    this.addTile(tile);
                });

                this.updateScore(score);
                this.updateBestScore(bestScore);

                this.message(status);
            });
        }

        // Continues the game (both restart and keep playing)
        public continueGame() {
            this.clearMessage();
        }

        public clearContainer(container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        public addTile(tile: State.Tile) {
            State.Tile.match(tile, {
                oldTile: t => this.addOldTile(t),
                newTile: t => this.addNewTile(t),
                movedTile: t => this.addMovedTile(t),
                mergedTile: t => this.addMergedTile(t)
            });
        }

        private addTileCore(tile: State.TileState) {
            let wrapper = document.createElement("div");
            let inner = document.createElement("div");

            let positionClass = getPositionClass(tile);
            
            var classes = ["tile", "tile-" + tile.value, positionClass];

            if (tile.value > gameMaxValue) classes.push("tile-super");

        }

        private createClasses(tile: State.Tile) {
            let positionClass = getPositionClass(tile);
    
            // We can't use classlist because it somehow glitches when replacing classes
            var classes = ["tile", "tile-" + tile.value, positionClass];

            if (tile.value > 2048) classes.push("tile-super");

            if (tile.isStable) classes.push("tile-stable");

            return classes;
        }

        private addOldTile(tile: State.Tile) {
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");
        
            //let positionClass = getPositionClass(tile);
    
            //// We can't use classlist because it somehow glitches when replacing classes
            //var classes = ["tile", "tile-" + tile.value, positionClass];

            //if (tile.value > 2048) classes.push("tile-super");
            let classes = this.createClasses(tile);

            this.applyClasses(wrapper, classes);

            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();

            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
    
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        }

        private addNewTile(tile: State.Tile) {
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");
        
            //let positionClass = getPositionClass(tile);
    
            //// We can't use classlist because it somehow glitches when replacing classes
            //var classes = ["tile", "tile-" + tile.value, positionClass];

            //if (tile.value > 2048) classes.push("tile-super");

            let classes = this.createClasses(tile);

            this.applyClasses(wrapper, classes);

            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();

            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
    
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
    
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        }

        private addMovedTile(tile: State.Tile) {
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");

            Contract.assert(tile.origins && tile.origins.length === 1, "For moved tile origins should have one element");
            let previousPosition = tile.origins[0];
            let positionClass = getPositionClass(previousPosition);
    
            // We can't use classlist because it somehow glitches when replacing classes
            var classes = ["tile", "tile-" + tile.value, positionClass];

            if (tile.value > 2048) classes.push("tile-super");

            this.applyClasses(wrapper, classes);

            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();

            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(() => {
                classes[2] = getPositionClass({ x: tile.x, y: tile.y });
                this.applyClasses(wrapper, classes); // Update the position
            });

            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
    
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        }

        private addMergedTile(tile: State.Tile) {

            var wrapper = document.createElement("div");
            var inner = document.createElement("div");

            Contract.assert(tile.origins && tile.origins.length !== 0, "For merged tiles origins should have at least one element");
            //let previousPosition = tile;//tile.origins[tile.origins.length - 1];

            //let positionClass = getPositionClass(previousPosition);
    
            // We can't use classlist because it somehow glitches when replacing classes
            //var classes = ["tile", "tile-" + tile.value, positionClass];

            //if (tile.value > 2048) classes.push("tile-super");
            let classes = this.createClasses(tile);

            this.applyClasses(wrapper, classes);

            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();

            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(() => {
                classes[2] = getPositionClass({ x: tile.x, y: tile.y });
                this.applyClasses(wrapper, classes); // Update the position
            });

            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);
    
            // Moving origin tiles to the destination.
            tile.origins.forEach(origin => {
                let moveTile = State.Tile.moveTile(tile.x, tile.y, tile.value, origin);
                this.addMovedTile(moveTile);
            });
    
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
    
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        }

        private applyClasses(element: HTMLDivElement, classes: string[]) {
            element.setAttribute("class", classes.join(" "));
        }

        private updateScore(score: number): void {
            this.clearContainer(this.scoreContainer);

            var difference = score - this.score;
            this.score = score;

            this.scoreContainer.textContent = this.score.toString();

            if (difference > 0) {
                var addition = document.createElement("div");
                addition.classList.add("score-addition");
                addition.textContent = "+" + difference;

                this.scoreContainer.appendChild(addition);
            }
        }

        private updateBestScore(bestScore: number) {
            this.bestContainer.textContent = bestScore.toString();
        }

        private message(status: GameStatus) {
            if (status === GameStatus.KeepPlaying) {
                return; // nothing to do!
            }

            var type = status === GameStatus.Victory ? "game-won" : "game-over";
            var message = status === GameStatus.Victory ? "You win!" : "Game over!";

            this.messageContainer.classList.add(type);
            this.messageContainer.getElementsByTagName("p")[0].textContent = message;
        }

        public clearMessage() {
            // IE only takes one value to remove at a time.
            this.messageContainer.classList.remove("game-won");
            this.messageContainer.classList.remove("game-over");
        }

    }

    //function HTMLActuator() {
    //    this.tileContainer = document.querySelector(".tile-container");
    //    this.scoreContainer = document.querySelector(".score-container");
    //    this.bestContainer = document.querySelector(".best-container");
    //    this.messageContainer = document.querySelector(".game-message");

    //    this.score = 0;
    //}

/*
actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated()
        });
*/

    //interface AnotherGameState {
    //    score: number;
    //    over: boolean;
    //    won: boolean;
    //    bestScore: number;
    //    terminated: boolean;
    //}

    //HTMLActuator.prototype.actuate = function(grid: Grid, metadata: AnotherGameState) {
    //    var self = this;

    //    window.requestAnimationFrame(function() {
    //        self.clearContainer(self.tileContainer);

    //        grid.cells.forEach(function(column) {
    //            column.forEach(function(cell) {
    //                if (cell) {
    //                    self.setValue(cell);
    //                }
    //            });
    //        });

    //        self.updateScore(metadata.score);
    //        self.updateBestScore(metadata.bestScore);

    //        if (metadata.terminated) {
    //            if (metadata.over) {
    //                self.message(false); // You lose
    //            } else if (metadata.won) {
    //                self.message(true); // You win!
    //            }
    //        }

    //    });
    //};

//    // Continues the game (both restart and keep playing)
//    HTMLActuator.prototype.continueGame = function() {
//        this.clearMessage();
//    };

//    HTMLActuator.prototype.clearContainer = function(container) {
//        while (container.firstChild) {
//            container.removeChild(container.firstChild);
//        }
//    };

//    HTMLActuator.prototype.setValue = function(tile: Tile) {
//        var self = this;

//        var wrapper = document.createElement("div");
//        var inner = document.createElement("div");

//        // TODO: lack of separation model from view! this is bad!
//        let position = tile.getPreviousOrCurrentPosition();
//        let positionClass = getPositionClass(position);

//        // We can't use classlist because it somehow glitches when replacing classes
//        var classes = ["tile", "tile-" + tile.value, positionClass];

//        if (tile.value > 2048) classes.push("tile-super");

//        this.applyClasses(wrapper, classes);

//        inner.classList.add("tile-inner");
//        inner.textContent = tile.value.toString();

//        if (tile.previousPosition) {
//            // Make sure that the tile gets rendered in the previous position first
//            window.requestAnimationFrame(function() {
//                classes[2] = getPositionClass({ x: tile.x, y: tile.y });
//                self.applyClasses(wrapper, classes); // Update the position
//            });
//        } else if (tile.mergedFrom) {
//            classes.push("tile-merged");
//            this.applyClasses(wrapper, classes);

//            // Render the tiles that merged
//            tile.mergedFrom.forEach(function(merged) {
//                self.setValue(merged);
//            });
//        } else {
//            classes.push("tile-new");
//            this.applyClasses(wrapper, classes);
//        }

//        // Add the inner part of the tile to the wrapper
//        wrapper.appendChild(inner);

//        // Put the tile on the board
//        this.tileContainer.appendChild(wrapper);
//    };

//    HTMLActuator.prototype.applyClasses = function(element, classes) {
//        element.setAttribute("class", classes.join(" "));
//    };

//// HTMLActuator.prototype.normalizePosition = function (position) {
////     return { x: position.x + 1, y: position.y + 1 };
//// };

    function normalizePosition(position: State.Cell) {
        return { x: position.x + 1, y: position.y + 1 };
    }

    function getPositionClass(position: State.Cell) {
        let np = normalizePosition(position);
        return `tile-position-${np.x}-${np.y}`;
    }

//// HTMLActuator.prototype.positionClass = function (position) {
////     position = this.normalizePosition(position);
////     return "tile-position-" + position.x + "-" + position.y;
//// };

//    HTMLActuator.prototype.updateScore = function(score) {
//        this.clearContainer(this.scoreContainer);

//        var difference = score - this.score;
//        this.score = score;

//        this.scoreContainer.textContent = this.score;

//        if (difference > 0) {
//            var addition = document.createElement("div");
//            addition.classList.add("score-addition");
//            addition.textContent = "+" + difference;

//            this.scoreContainer.appendChild(addition);
//        }
//    };

//    HTMLActuator.prototype.updateBestScore = function(bestScore) {
//        this.bestContainer.textContent = bestScore;
//    };

//    HTMLActuator.prototype.message = function(won) {
//        var type = won ? "game-won" : "game-over";
//        var message = won ? "You win!" : "Game over!";

//        this.messageContainer.classList.add(type);
//        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
//    };

//    HTMLActuator.prototype.clearMessage = function() {
//        // IE only takes one value to remove at a time.
//        this.messageContainer.classList.remove("game-won");
//        this.messageContainer.classList.remove("game-over");
//    };

}