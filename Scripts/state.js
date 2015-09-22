/// <reference path="globals.ts"/>
/// <reference path="contract.ts"/>
var State;
(function (State) {
    (function (GameStatus) {
        GameStatus[GameStatus["Victory"] = 0] = "Victory";
        GameStatus[GameStatus["KeepPlaying"] = 1] = "KeepPlaying";
        GameStatus[GameStatus["GameOver"] = 2] = "GameOver";
    })(State.GameStatus || (State.GameStatus = {}));
    var GameStatus = State.GameStatus;
    function cellsAreEquals(left, right) {
        return left.x === right.x && left.y === right.y;
    }
    State.cellsAreEquals = cellsAreEquals;
    (function (TileType) {
        TileType[TileType["Old"] = 0] = "Old";
        TileType[TileType["New"] = 1] = "New";
        TileType[TileType["Moved"] = 2] = "Moved";
        TileType[TileType["Merged"] = 3] = "Merged";
        TileType[TileType["Empty"] = 4] = "Empty";
    })(State.TileType || (State.TileType = {}));
    var TileType = State.TileType;
    // Helper namespace with additional functions for Tiles
    var Tile;
    (function (Tile) {
        function newTile(x, y, value, isStable) {
            return { x: x, y: y, value: value, type: TileType.New, isStable: isStable };
        }
        Tile.newTile = newTile;
        function moveTile(x, y, value, origin) {
            Contract.requires(notNull(origin), "Origin cell should be defined");
            return { x: x, y: y, value: value, type: TileType.Moved, origins: [origin] };
        }
        Tile.moveTile = moveTile;
        function emptyTile(x, y) {
            return { x: x, y: y, value: undefined, type: TileType.Empty };
        }
        Tile.emptyTile = emptyTile;
        function oldTile(x, y, value) {
            return { x: x, y: y, value: value, type: TileType.Old };
        }
        Tile.oldTile = oldTile;
        function stableTile(x, y, value) {
            return { x: x, y: y, value: value, type: TileType.Old, isStable: true };
        }
        Tile.stableTile = stableTile;
        function cloneTile(tile) {
            return { x: tile.x, y: tile.y, value: tile.value, type: tile.type, sourceCells: tile.origins };
        }
        Tile.cloneTile = cloneTile;
        function mergeTiles(destination, value, mergeWithStable) {
            var origins = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                origins[_i - 3] = arguments[_i];
            }
            var sourceCells = origins.filter(function (f) { return notNull(f); });
            Contract.assert(sourceCells.length >= 1, "For merged cells at least one source cell should be defined");
            return {
                x: destination.x,
                y: destination.y,
                value: value,
                type: TileType.Merged,
                origins: sourceCells,
                isStable: mergeWithStable,
            };
        }
        Tile.mergeTiles = mergeTiles;
        function hasMovesOrMerges(tiles) {
            return tiles.some(function (t) { return t.type === TileType.Merged || t.type === TileType.Moved; });
        }
        Tile.hasMovesOrMerges = hasMovesOrMerges;
        function hasTileWithValue(tiles, value) {
            return tiles.some(function (t) { return t && t.value === value; });
        }
        Tile.hasTileWithValue = hasTileWithValue;
        function match(tile, handler) {
            switch (tile.type) {
                case TileType.Old:
                    handler.oldTile(tile);
                    break;
                case State.TileType.New:
                    handler.newTile(tile);
                    break;
                case TileType.Moved:
                    handler.movedTile(tile);
                    break;
                case TileType.Merged:
                    handler.mergedTile(tile);
                    break;
                default:
                    Contract.assert(false, "Unknown tile type '" + tile.type + "'");
            }
        }
        Tile.match = match;
        function computeScore(tiles) {
            var result = 0;
            tiles.forEach(function (t) {
                if (t.type === TileType.Merged) {
                    result = result + t.value;
                }
            });
            return result;
        }
        Tile.computeScore = computeScore;
    })(Tile = State.Tile || (State.Tile = {}));
})(State || (State = {}));
//# sourceMappingURL=state.js.map