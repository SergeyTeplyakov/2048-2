/// <reference path="globals.ts"/>
/// <reference path="grid.ts"/>

module Model {
    import Tile = State.Tile;
    import TileState = State.TileState;
    import Direction = State.Direction;

    /**
     * Simple wrapper on top of the Grid class that adds random tiles after each move.
     * 
     */
    export class GridController {
        private grid: Grid;

        constructor(public size: number, previousState?: Array<TileState>) {
            this.grid = new Grid(size);

            if (previousState) {
                this.applyGridChanges(previousState);
            }
        }

        //----------------------------------------------------------------------------
        // Public interface
        //----------------------------------------------------------------------------

        public addRandomTiles(count: number): Tile[] {
            let result: Tile[] = [];

            for (let i = 0; i < count; i++) {
                let cell = this.grid.randomAvailableCell();
                let value = getRandomTileValue();

                this.grid.setValue({ x: cell.x, y: cell.y, value: value });
                result.push(Tile.newTile(cell.x, cell.y, value));
            }

            return result;
        }

        public move(direction: Direction): Tile[] {
            return this.grid.move(direction);
        }

        public hasMoves(): boolean {
            return this.grid.hasMoves();
        }

        public state(): State.GridState {
            return this.grid.state();
        }

        public isFull(): boolean {
            return this.grid.isFull();
        }

        //----------------------------------------------------------------------------
        // Implementation
        //----------------------------------------------------------------------------
        private applyGridChanges(tiles: Array<TileState>): void {
            for (let tile of tiles) {
                Contract.assert(this.grid.isInRange(tile), 'tile should be withing grid range');
                Contract.assert(notNull(tile.value), 'tile.value should not be null or undefined');

                this.grid.setValue(tile);
            }
        }
    }
}