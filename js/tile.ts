interface TilePosition {
    x: number;
    y: number;
}

interface TileData {
    position: TilePosition;
    value: number;
}

class Tile {
    x: number;
    y: number;
    value: number;
    previousPosition: TilePosition;

    // TODO: next step - wrap this into methods and hide away!
    public mergeFrom: any;

    constructor(position: TilePosition, value: number) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
    }

    savePosition(): void {
        this.previousPosition = {
            x: this.x,
            y: this.y
        }
    }

    updatePosition(position: TilePosition): void {
        this.x = position.x;
        this.y = position.y;
    }

    serialize(): TileData {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    }
}

