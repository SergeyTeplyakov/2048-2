// Can't use let's here, they won't be visible outside this file
var gameMaxValue = 2048;
var startTilesCount = 2;
var moveTilesCount = 1;

function getRandomTileValue(): number {
    return Math.random() < 0.9 ? 2 : 4;
}
