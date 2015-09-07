/// <reference path="tile.ts"/>

class Grid {
    size: number;
    cells: Array<Tile[]>;

    constructor(size: number, previousState?: Array<TileState[]>) {
        this.size = size;

        this.cells = previousState ? Grid.fromState(size, previousState) : Grid.empty(size);
    }

    private static fromState(size: number, state: Array<TileState[]>): Tile[][] {
        var cells = new Array<Tile[]>(size);

        for (var x = 0; x < size; x++) {
            var row = cells[x] = new Array<Tile>(size);

            for (var y = 0; y < size; y++) {
                // TODO: it seems that this is a bug, if state[x][y] is null! Right?
                var tile = state[x][y];
                row[y] = tile && new Tile(tile.position, tile.value);
                
                
                
                // TODO: more functional approach? and create all this stuff from the beginning?
          
                // TODO: not sure about this null check!
                // row.push(tile ? new Tile(tile.position, tile.value) : null);
            }
        }

        return cells;
    }

    private static empty(size: number): Array<Tile[]> {
        var cells = new Array<Tile[]>(size);

        for (let x = 0; x < size; x++) {
            cells[x] = new Array<Tile>(size); 
        }

        return cells;
    }
  
    // Find the first available random position
  randomAvailableCell() {
    var cells = this.availableCells();
  
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
    
    return null;
  };
  
    
    // Check if there are any cells available
    cellsAvailable(): boolean {
        return !!this.availableCells().length;
    }
  
    // Call callback for every cell  
    eachCell(callback: (x: number, y: number, tile: Tile) => void): void {
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }   
    }
    
    availableCells(): Array<{x: number, y: number}> {
        var cells = new Array<{x: number, y: number}>();
  
        this.eachCell(
            (x, y, tile) => {
                if (!tile) {
                    cells.push({x: x, y: y});
                }
            });
    
        return cells;
    }
    
    // Check if the specified cell is taken
    cellAvailable(cell: TilePosition): boolean {
        return !this.cellOccupied(cell);
    }
    
    cellOccupied(cell: TilePosition): boolean {
        
        // TODO: is this the same as cellContent(cell) != null? I dont think that it could be undefined!
        // TODO: this stuff hids potential bugs and returns null if cell is invalid!
        return !!this.cellContent(cell);
    }
    
    cellContent(cell: TilePosition): Tile {
        // TODO: not sure why this required!! This is a bug if the cell is out of bounds!
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        }
        
        return null;
    }
    
    // Inserts a tile at its position
    insertTile(tile: Tile) {
        this.cells[tile.x][tile.y] = tile;
    }
    
    removeTile(tile: Tile) {
        this.cells[tile.x][tile.y] = null;
    };
    
    // TODO: why the hell this is reauired!! This is a bug if this returns false!!!
    withinBounds(position: TilePosition): boolean {
        return position.x >= 0 && position.x < this.size &&
            position.y >= 0 && position.y < this.size;
    }

    serialize(): { size: number, cells: Array<TileState[]> } {
        var cellState = new Array<TileState[]>(this.size);

        for (var x = 0; x < this.size; x++) {
            var row = cellState[x] = [];

            for (var y = 0; y < this.size; y++) {
                row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }
        }

        return {
            size: this.size,
            cells: cellState
        };
    }
}