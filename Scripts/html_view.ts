/// <reference path="globals.ts"/>
/// <reference path="state.ts"/>
/// <reference path="grid.ts"/>

module View {
    import GameStatus = State.GameStatus;

    export interface HtmlView {
        updateView(level: number, tiles: State.Tile[], score: number, bestScore: number, status: State.GameStatus): void;
        clearMessage(): void;
        addTile(tile: State.Tile): void;
    }

    export function createView(): HtmlView {
        return new HtmlViewImpl();
    }

    class HtmlViewImpl implements HtmlView {
        private tileContainer: Element;
        private scoreContainer: Element;
        private levelContainer: Element;
        private bestContainer: Element;
        private messageContainer: Element;

        private score: number;
        private level: number;

        constructor() {
            this.tileContainer = document.querySelector(".tile-container");
            this.levelContainer = document.querySelector(".level");
            this.scoreContainer = document.querySelector(".score-container");
            this.bestContainer = document.querySelector(".best-container");
            this.messageContainer = document.querySelector(".game-message");

            this.score = 0;
            this.level = 0;
        }

        public updateView(level: number, tiles: State.Tile[], score: number, bestScore: number, status: State.GameStatus) {
            window.requestAnimationFrame(() => {
                this.clearContainer(this.tileContainer);

                tiles.forEach(tile => {
                    this.addTile(tile);
                });

                this.updateLevel(level);
                this.updateScore(score);
                this.updateBestScore(bestScore);

                this.message(status);
            });
        }

        private clearContainer(container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        public addTile(tile: State.Tile) {
            State.Tile.match(tile, {
                oldTile: t => this.doAddTile(t),
                newTile: t => this.doAddTile(t, "tile-new"),
                movedTile: t => this.addMovedTile(t),
                mergedTile: t => this.addMergedTile(t)
            });
        }

        private createClasses(tile: {x: number, y: number, value: number, isStable?: boolean}) {
            let positionClass = getPositionClass(tile);
    
            // We can't use classlist because it somehow glitches when replacing classes
            var classes = ["tile", "tile-" + tile.value, positionClass];

            if (tile.value > 2048) classes.push("tile-super");

            if (tile.isStable) classes.push("tile-stable");

            return classes;
        }

        private doAddTile(tile: State.Tile, ...additionalClasses: string[]) {
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");

            let classes: string[] = [...this.createClasses(tile), ...additionalClasses];

            this.applyClasses(wrapper, classes);

            inner.classList.add("tile-inner");
            inner.textContent = tile.value.toString();

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
            let classes = this.createClasses({ x: previousPosition.x, y: previousPosition.y, value: tile.value });

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
    
    
            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);
    
            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);

            // Moving origin tiles to the destination.
            tile.origins.forEach(origin => {
                let moveTile = State.Tile.moveTile(tile.x, tile.y, tile.value, origin);
                this.addMovedTile(moveTile);
            });

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

        private updateLevel(level: number): void {
            this.clearContainer(this.levelContainer);
            this.level = level;
            this.levelContainer.textContent = this.level.toString();
        }

        private updateBestScore(bestScore: number) {
            this.bestContainer.textContent = bestScore.toString();
        }

        private message(status: GameStatus) {
            if (status === GameStatus.KeepPlaying) {
                return; // nothing to do!
            }

            var type = status === GameStatus.Victory ? "game-won" : "game-over";
            var message = status === GameStatus.Victory ? `Level ${this.level} completed!` : "Game over!";

            this.messageContainer.classList.add(type);
            this.messageContainer.getElementsByTagName("p")[0].textContent = message;
        }

        public clearMessage() {
            // IE only takes one value to remove at a time.
            this.messageContainer.classList.remove("game-won");
            this.messageContainer.classList.remove("game-over");
        }
    }

    function normalizePosition(position: State.Cell) {
        return { x: position.x + 1, y: position.y + 1 };
    }

    function getPositionClass(position: State.Cell) {
        let np = normalizePosition(position);
        return `tile-position-${np.x}-${np.y}`;
    }
}