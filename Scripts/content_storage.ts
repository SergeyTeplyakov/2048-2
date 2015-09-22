/// <reference path="state.ts"/>
/// <reference path="contract.ts"/>

module Store {

    const permanentStateKey = "permamentState";
    const temporaryStateKey = "currentGameState";
    const defaultStorageName = "fakeStorage";

    export class ContentStorage {
        storage: Storage;

        constructor(storageName?: string) {
            this.storage = createLocalStorage(storageName || defaultStorageName);
        }

        public getGameStatistic(): State.GameStatistic {
            var stateJson = this.storage.getItem(permanentStateKey);
            return stateJson ? JSON.parse(stateJson) : null;
        }

        public getCurrentLevel(): number {
            let statistics = this.getGameStatistic();
            return (statistics && statistics.level) || 1;
        }

        public saveCurrentLevel(newLevel: number) {
            Contract.requires(newLevel >= 0, `newLevel should be >= 0, but was ${newLevel}`);

            let statistics = this.getGameStatistic();
            statistics = statistics || { bestScore: 0, level: 1 };

            statistics.level = newLevel;

            this.updateGameStatistic(statistics);
        }

        public updateGameStatistic(state: State.GameStatistic) {
            this.storage.setItem(permanentStateKey, JSON.stringify(state));
        }

        public getGameState(): State.GameState {
            var stateJson = this.storage.getItem(temporaryStateKey);
            return stateJson ? JSON.parse(stateJson) : null;
        }

        public updateGameState(state: State.GameState) {
            this.storage.setItem(temporaryStateKey, JSON.stringify(state));
        }

        // for testing purposes!
        /*internal*/public reset() {
            this.storage.setItem(permanentStateKey, null);
            this.storage.setItem(temporaryStateKey, null);
        }

        public getBestScore() {
            let statistics = this.getGameStatistic();
            return (statistics && statistics.bestScore) || 0;
        }

        public clearGameState() {
            this.updateGameState(null);
        }

        public updateBestScoreIfNeeded(bestScore: number) {
            Contract.requires(bestScore >= 0, `bestScore should be >= 0, but was ${bestScore}`);

            // You can read this code as: if (bestScore > (statistics?.bestScore ?? 0) {
            let permanentState = this.getGameStatistic();

            if (bestScore > ((permanentState && permanentState.bestScore) || 0)) {
                this.updateGameStatistic({ bestScore: bestScore, level: (permanentState && permanentState.level) || 1 });
            }
        }
    }

    class CustomLocalStorage implements Storage {
        // TODO: switch to Map<??, string>. Is there anything like this in TS?s
        private data: any = {};

        setItem(key: string, data: string): void {
            this.data[key] = data;
        }

        getItem(key: string): any {
            return this.data.hasOwnProperty(key) ? this.data[key] : undefined;
        }

        removeItem(key: string): void {
            delete this.data[key];
        }

        clear(): void {
            this.data = {};
        }

        length: number;
        key: any;

        [key: string]: any;
    }

    function createLocalStorage(storageName: string): Storage {
        if (localStorageSupported()) {
            return window.localStorage;
        }

        let storage = window[storageName];
        if (!storage) {
            storage = new CustomLocalStorage();
        }

        window[storageName] = storage;

        return storage;

        function localStorageSupported(): boolean {
            var testKey = "test";
            var storage = window.localStorage;

            try {
                storage.setItem(testKey, "1");
                storage.removeItem(testKey);
                return true;
            } catch (error) {
                return false;
            }
        }
    }
}