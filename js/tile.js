var Tile = (function () {
    function Tile(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
    }
    Tile.prototype.getPreviousOrCurrentPosition = function () {
        return this.previousPosition || { x: this.x, y: this.y };
    };
    Tile.prototype.saveCurrentPositionAsPrevious = function () {
        // Not sure why, but those two operations are always in pair!
        this.mergedFrom = null;
        this.previousPosition = {
            x: this.x,
            y: this.y
        };
    };
    Tile.prototype.updatePosition = function (position) {
        this.x = position.x;
        this.y = position.y;
    };
    Tile.prototype.serialize = function () {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    };
    Tile.prototype.getValue = function () {
        return this.value;
    };
    Tile.prototype.getX = function () {
        return this.x;
    };
    Tile.prototype.getY = function () {
        return this.y;
    };
    return Tile;
})();
//# sourceMappingURL=tile.js.map