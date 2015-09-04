var CustomLocalStorage = (function () {
    function CustomLocalStorage() {
        // TODO: switch to Map<??, string>.
        this._data = {};
    }
    CustomLocalStorage.prototype.setItem = function (key, data) {
        this._data[key] = data;
    };
    CustomLocalStorage.prototype.getItem = function (key) {
        return this._data.hasOwnProperty(key) ? this._data[key] : undefined;
    };
    CustomLocalStorage.prototype.removeItem = function (key) {
        delete this._data[key];
    };
    CustomLocalStorage.prototype.clear = function () {
        this._data = {};
    };
    return CustomLocalStorage;
})();
function createStorage() {
    if (localStorageSupported()) {
        return window.localStorage;
    }
    var storage = window["fakeStorage"];
    if (!storage) {
        storage = new CustomLocalStorage();
        window["fakeStorage"] = storage;
    }
    return storage;
    function localStorageSupported() {
        var testKey = "test";
        var storage = window.localStorage;
        try {
            storage.setItem(testKey, "1");
            storage.removeItem(testKey);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
var LocalStorageManager = (function () {
    function LocalStorageManager() {
        this.storage = createStorage();
    }
    // Best score getters/setters
    LocalStorageManager.prototype.getBestScore = function () {
        return this.storage.getItem(LocalStorageManager.bestScoreKey) || 0;
    };
    LocalStorageManager.prototype.setBestScore = function (score) {
        this.storage.setItem(LocalStorageManager.bestScoreKey, score.toString());
    };
    // Game state getters/setters and clearing
    LocalStorageManager.prototype.getGameState = function () {
        var stateJSON = this.storage.getItem(LocalStorageManager.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    };
    // Add strongly-typed game state
    LocalStorageManager.prototype.setGameState = function (gameState) {
        this.storage.setItem(LocalStorageManager.gameStateKey, JSON.stringify(gameState));
    };
    LocalStorageManager.prototype.clearGameState = function () {
        this.storage.removeItem(LocalStorageManager.gameStateKey);
    };
    LocalStorageManager.bestScoreKey = "bestScore";
    LocalStorageManager.gameStateKey = "gameState";
    return LocalStorageManager;
})();
