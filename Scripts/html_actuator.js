/// <reference path="state.ts"/>
/// <reference path="grid.ts"/>
var View;
(function (View) {
    var GameStatus = Model.GameStatus;
    var HtmlActuator = (function () {
        function HtmlActuator() {
            this.tileContainer = document.querySelector(".tile-container");
            this.scoreContainer = document.querySelector(".score-container");
            this.bestContainer = document.querySelector(".best-container");
            this.messageContainer = document.querySelector(".game-message");
            this.score = 0;
        }
        HtmlActuator.prototype.updateView = function (state, bestScore) {
            var _this = this;
            window.requestAnimationFrame(function () {
                _this.clearContainer(_this.tileContainer);
                state.grid.cells.forEach(function (tile) {
                    _this.addTile(tile);
                });
                _this.updateScore(state.score);
                _this.updateBestScore(bestScore);
                _this.message(state.status);
            });
        };
        // Continues the game (both restart and keep playing)
        HtmlActuator.prototype.continueGame = function () {
            this.clearMessage();
        };
        HtmlActuator.prototype.clearContainer = function (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        };
        HtmlActuator.prototype.addTile = function (tile) {
            var _this = this;
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");
            var positionClass = getPositionClass(tile);
            // We can't use classlist because it somehow glitches when replacing classes
            var classes = ["tile", "tile-" + tile.value, positionClass];
            // TODO: extract 2048 and move it somewhere!?
            if (tile.value > 2048)
                classes.push("tile-super");
            this.applyClasses(wrapper, classes);
            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();
            if (tile.from) {
                // Make sure that the tile gets rendered in the previous position first
                window.requestAnimationFrame(function () {
                    classes[2] = getPositionClass(tile.from);
                    _this.applyClasses(wrapper, classes); // Update the position
                });
            }
            else if (tile.merged) {
                classes.push("tile-merged");
                this.applyClasses(wrapper, classes);
                // Render the tiles that merged
                this.addTile(tile.from);
            }
            else {
                classes.push("tile-new");
                this.applyClasses(wrapper, classes);
            }
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        };
        HtmlActuator.prototype.applyClasses = function (element, classes) {
            element.setAttribute("class", classes.join(" "));
        };
        HtmlActuator.prototype.updateScore = function (score) {
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
        };
        HtmlActuator.prototype.updateBestScore = function (bestScore) {
            this.bestContainer.textContent = bestScore.toString();
        };
        HtmlActuator.prototype.message = function (status) {
            if (status === GameStatus.KeepPlaying) {
                return; // nothing to do!
            }
            var type = status === GameStatus.Victory ? "game-won" : "game-over";
            var message = status === GameStatus.Victory ? "You win!" : "Game over!";
            this.messageContainer.classList.add(type);
            this.messageContainer.getElementsByTagName("p")[0].textContent = message;
        };
        HtmlActuator.prototype.clearMessage = function () {
            // IE only takes one value to remove at a time.
            this.messageContainer.classList.remove("game-won");
            this.messageContainer.classList.remove("game-over");
        };
        return HtmlActuator;
    })();
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
    //                    self.addTile(cell);
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
    //    HTMLActuator.prototype.addTile = function(tile: Tile) {
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
    //                self.addTile(merged);
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
    function normalizePosition(position) {
        return { x: position.x + 1, y: position.y + 1 };
    }
    function getPositionClass(position) {
        var np = normalizePosition(position);
        return "tile-position-" + np.x + "-" + np.y;
    }
})(View || (View = {}));
//# sourceMappingURL=html_actuator.js.map