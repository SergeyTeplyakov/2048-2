/// <reference path="state.ts"/>
/// <reference path="contract.ts"/>
var Store;
(function (Store) {
    var permanentStateKey = "permamentState";
    var temporaryStateKey = "currentGameState";
    var defaultStorageName = "fakeStorage";
    var ContentStorage = (function () {
        function ContentStorage(storageName) {
            this.storage = createLocalStorage(storageName || defaultStorageName);
        }
        ContentStorage.prototype.getGameStatistic = function () {
            var stateJson = this.storage.getItem(permanentStateKey);
            return stateJson ? JSON.parse(stateJson) : null;
        };
        ContentStorage.prototype.getCurrentLevel = function () {
            var statistics = this.getGameStatistic();
            return (statistics && statistics.level) || 1;
        };
        ContentStorage.prototype.saveCurrentLevel = function (newLevel) {
            Contract.requires(newLevel >= 0, "newLevel should be >= 0, but was " + newLevel);
            var statistics = this.getGameStatistic();
            statistics = statistics || { bestScore: 0, level: 1 };
            statistics.level = newLevel;
            this.updateGameStatistic(statistics);
        };
        ContentStorage.prototype.updateGameStatistic = function (state) {
            this.storage.setItem(permanentStateKey, JSON.stringify(state));
        };
        ContentStorage.prototype.getGameState = function () {
            var stateJson = this.storage.getItem(temporaryStateKey);
            return stateJson ? JSON.parse(stateJson) : null;
        };
        ContentStorage.prototype.updateGameState = function (state) {
            this.storage.setItem(temporaryStateKey, JSON.stringify(state));
        };
        // for testing purposes!
        /*internal*/ ContentStorage.prototype.reset = function () {
            this.storage.setItem(permanentStateKey, null);
            this.storage.setItem(temporaryStateKey, null);
        };
        ContentStorage.prototype.getBestScore = function () {
            var statistics = this.getGameStatistic();
            return (statistics && statistics.bestScore) || 0;
        };
        ContentStorage.prototype.clearGameState = function () {
            this.updateGameState(null);
        };
        ContentStorage.prototype.updateBestScoreIfNeeded = function (bestScore) {
            Contract.requires(bestScore >= 0, "bestScore should be >= 0, but was " + bestScore);
            // You can read this code as: if (bestScore > (statistics?.bestScore ?? 0) {
            var permanentState = this.getGameStatistic();
            if (bestScore > ((permanentState && permanentState.bestScore) || 0)) {
                this.updateGameStatistic({ bestScore: bestScore, level: (permanentState && permanentState.level) || 1 });
            }
        };
        return ContentStorage;
    })();
    Store.ContentStorage = ContentStorage;
    var CustomLocalStorage = (function () {
        function CustomLocalStorage() {
            // TODO: switch to Map<??, string>. Is there anything like this in TS?s
            this.data = {};
        }
        CustomLocalStorage.prototype.setItem = function (key, data) {
            this.data[key] = data;
        };
        CustomLocalStorage.prototype.getItem = function (key) {
            return this.data.hasOwnProperty(key) ? this.data[key] : undefined;
        };
        CustomLocalStorage.prototype.removeItem = function (key) {
            delete this.data[key];
        };
        CustomLocalStorage.prototype.clear = function () {
            this.data = {};
        };
        return CustomLocalStorage;
    })();
    function createLocalStorage(storageName) {
        if (localStorageSupported()) {
            return window.localStorage;
        }
        var storage = window[storageName];
        if (!storage) {
            storage = new CustomLocalStorage();
        }
        window[storageName] = storage;
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
})(Store || (Store = {}));
//# sourceMappingURL=content_storage.js.map