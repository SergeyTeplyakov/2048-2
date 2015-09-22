/// <reference path="../Scripts/content_storage.ts"/>
/// <reference path="../Scripts/state.ts"/>
var ContentStorage_Tests;
(function (ContentStorage_Tests) {
    var GameStatus = State.GameStatus;
    QUnit.module("ContentStorage tests");
    test("get/updateGameState tests", function () {
        var storage = new Store.ContentStorage();
        storage.reset();
        equal(storage.getGameState(), undefined);
        storage.updateGameState({
            score: 42,
            status: GameStatus.KeepPlaying,
            grid: {
                size: 1,
                cells: [{ x: 0, y: 0, value: 2 }],
                stableCells: [],
            }
        });
        var gameState = storage.getGameState();
        ok(gameState, 'gameState should not be null or undefined');
        equal(gameState.score, 42, "score should be 42, but was " + gameState.score);
        equal(gameState.status, GameStatus.KeepPlaying, "status should be KeepPlaying, but was " + gameState.status);
        ok(gameState.grid, "gridState should be defined");
        equal(gameState.grid.size, 1, "grid should have size 1, but was " + gameState.grid.size);
        equal(gameState.grid.cells[0].value, 2, "grid.cells[0] should be 2 but was " + gameState.grid.cells[0].value);
    });
    test("get/updateGameStatistic tests", function () {
        var storage = new Store.ContentStorage();
        storage.reset();
        equal(storage.getGameStatistic(), undefined);
        storage.updateGameStatistic({
            bestScore: 42,
            level: 3
        });
        var gameState = storage.getGameStatistic();
        ok(gameState, 'gameStatistic should not be null or undefined');
        equal(gameState.bestScore, 42, "best score should be 42, but was " + gameState.bestScore);
        equal(gameState.level, 3, "level should be 3, but was " + gameState.level);
    });
})(ContentStorage_Tests || (ContentStorage_Tests = {}));
//# sourceMappingURL=content_storage_Tests.js.map