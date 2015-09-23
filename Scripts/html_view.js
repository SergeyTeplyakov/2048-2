/// <reference path="globals.ts"/>
/// <reference path="state.ts"/>
/// <reference path="grid.ts"/>
var View;
(function (View) {
    var GameStatus = State.GameStatus;
    function createView() {
        return new HtmlViewImpl();
    }
    View.createView = createView;
    var HtmlViewImpl = (function () {
        function HtmlViewImpl() {
            this.tileContainer = document.querySelector(".tile-container");
            this.levelContainer = document.querySelector(".level");
            this.scoreContainer = document.querySelector(".score-container");
            this.bestContainer = document.querySelector(".best-container");
            this.messageContainer = document.querySelector(".game-message");
            this.score = 0;
            this.level = 0;
        }
        HtmlViewImpl.prototype.updateView = function (level, tiles, score, bestScore, status) {
            var _this = this;
            window.requestAnimationFrame(function () {
                _this.clearContainer(_this.tileContainer);
                tiles.forEach(function (tile) {
                    _this.addTile(tile);
                });
                _this.updateLevel(level);
                _this.updateScore(score);
                _this.updateBestScore(bestScore);
                _this.message(status);
            });
        };
        HtmlViewImpl.prototype.clearContainer = function (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        };
        HtmlViewImpl.prototype.addTile = function (tile) {
            var _this = this;
            State.Tile.match(tile, {
                oldTile: function (t) { return _this.doAddTile(t); },
                newTile: function (t) { return _this.doAddTile(t, "tile-new"); },
                movedTile: function (t) { return _this.addMovedTile(t); },
                mergedTile: function (t) { return _this.addMergedTile(t); }
            });
        };
        HtmlViewImpl.prototype.createClasses = function (tile) {
            var positionClass = getPositionClass(tile);
            // We can't use classlist because it somehow glitches when replacing classes
            var classes = ["tile", "tile-" + tile.value, positionClass];
            if (tile.value > 2048)
                classes.push("tile-super");
            if (tile.isStable)
                classes.push("tile-stable");
            return classes;
        };
        HtmlViewImpl.prototype.doAddTile = function (tile) {
            var additionalClasses = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                additionalClasses[_i - 1] = arguments[_i];
            }
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");
            var classes = this.createClasses(tile).concat(additionalClasses);
            this.applyClasses(wrapper, classes);
            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        };
        HtmlViewImpl.prototype.addMovedTile = function (tile) {
            var _this = this;
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");
            Contract.assert(tile.origins && tile.origins.length === 1, "For moved tile origins should have one element");
            var previousPosition = tile.origins[0];
            var classes = this.createClasses({ x: previousPosition.x, y: previousPosition.y, value: tile.value });
            this.applyClasses(wrapper, classes);
            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(function () {
                classes[2] = getPositionClass({ x: tile.x, y: tile.y });
                _this.applyClasses(wrapper, classes); // Update the position
            });
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        };
        HtmlViewImpl.prototype.addMergedTile = function (tile) {
            var _this = this;
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");
            Contract.assert(tile.origins && tile.origins.length !== 0, "For merged tiles origins should have at least one element");
            var classes = this.createClasses(tile);
            this.applyClasses(wrapper, classes);
            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(function () {
                classes[2] = getPositionClass({ x: tile.x, y: tile.y });
                _this.applyClasses(wrapper, classes); // Update the position
            });
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
            // Moving origin tiles to the destination.
            tile.origins.forEach(function (origin) {
                var moveTile = State.Tile.moveTile(tile.x, tile.y, tile.value, origin);
                _this.addMovedTile(moveTile);
            });
        };
        HtmlViewImpl.prototype.applyClasses = function (element, classes) {
            element.setAttribute("class", classes.join(" "));
        };
        HtmlViewImpl.prototype.updateScore = function (score) {
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
        HtmlViewImpl.prototype.updateLevel = function (level) {
            this.clearContainer(this.levelContainer);
            this.level = level;
            this.levelContainer.textContent = this.level.toString();
        };
        HtmlViewImpl.prototype.updateBestScore = function (bestScore) {
            this.bestContainer.textContent = bestScore.toString();
        };
        HtmlViewImpl.prototype.message = function (status) {
            if (status === GameStatus.KeepPlaying) {
                return; // nothing to do!
            }
            var type = status === GameStatus.Victory ? "game-won" : "game-over";
            var message = status === GameStatus.Victory ? "Level " + this.level + " completed!" : "Game over!";
            this.messageContainer.classList.add(type);
            this.messageContainer.getElementsByTagName("p")[0].textContent = message;
        };
        HtmlViewImpl.prototype.clearMessage = function () {
            // IE only takes one value to remove at a time.
            this.messageContainer.classList.remove("game-won");
            this.messageContainer.classList.remove("game-over");
        };
        return HtmlViewImpl;
    })();
    function normalizePosition(position) {
        return { x: position.x + 1, y: position.y + 1 };
    }
    function getPositionClass(position) {
        var np = normalizePosition(position);
        return "tile-position-" + np.x + "-" + np.y;
    }
})(View || (View = {}));
//# sourceMappingURL=html_view.js.map