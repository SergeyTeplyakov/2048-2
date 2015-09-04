var Tile = (function () {
    function Tile(position, value) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;
    }
    Tile.prototype.savePosition = function () {
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
    return Tile;
})();
//# sourceMappingURL=tile.js.map