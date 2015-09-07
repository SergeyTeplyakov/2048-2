/// <reference path="tile.ts"/>

class CustomLocalStorage implements Storage {
    // TODO: switch to Map<??, string>.
    _data: any = {};    
    
    setItem(key: string, data: string): void {
        this._data[key] = data;
    }

    getItem(key: string): any {
        return this._data.hasOwnProperty(key) ? this._data[key] : undefined;
    }

    removeItem(key: string): void {
        delete this._data[key];
    }

    clear(): void {
        this._data = {};
    }
    
    length : number;
    key: any;
    
    [key: string]: any;
}

function createStorage() : Storage {
    if (localStorageSupported()) {
        return window.localStorage;
    }
    
    let storage = window["fakeStorage"];
    if (!storage) {
        storage = new CustomLocalStorage();
        window["fakeStorage"] = storage;
    }
        
    return storage;
    
    function localStorageSupported() : boolean {
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

class LocalStorageManager {
    static bestScoreKey = "bestScore";
    static gameStateKey = "gameState";
    private storage = createStorage();
     
    // Best score getters/setters
    getBestScore(): number {
        return this.storage.getItem(LocalStorageManager.bestScoreKey) || 0;
    }

    setBestScore(score: number) {
        this.storage.setItem(LocalStorageManager.bestScoreKey, score.toString());
    }
    
    updateBestScoreIfNeeded(score: number) {
        if (this.getBestScore() < score) {
            this.setBestScore(score);
        }
    }

    // Game state getters/setters and clearing
    getGameState(): GameState {
        var stateJSON = this.storage.getItem(LocalStorageManager.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    }

    // Add strongly-typed game state
    setGameState(gameState: GameState) {
        this.storage.setItem(LocalStorageManager.gameStateKey, JSON.stringify(gameState));
    }

    clearGameState() {
        this.storage.removeItem(LocalStorageManager.gameStateKey);
    }
}