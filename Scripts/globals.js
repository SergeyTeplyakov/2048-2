// Can't use let's here, they won't be visible outside this file
var gameMaxValue = 2048;
var startTilesCount = 2;
var moveTilesCount = 1;
var stableTilesCount = 1;
var defaultStableValue = 2;
//var numberOfRandomTiles = startTilesCount - numberOfStableTiles;
function getRandomTileValue() {
    return Math.random() < 0.9 ? 2 : 4;
}
function getLevelTargetTile(level) {
    return Math.pow(2, level);
}
//# sourceMappingURL=globals.js.map