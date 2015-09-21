/// <reference path="game_manager.ts"/>

let keyboardMap = {
    38: Direction.Up, // Up
    39: Direction.Right, // Right
    40: Direction.Down, // Down
    37: Direction.Left, // Left
    75: Direction.Up, // Vim up
    76: Direction.Right, // Vim right
    74: Direction.Down, // Vim down
    72: Direction.Left, // Vim left
    87: Direction.Up, // W
    68: Direction.Right, // D
    83: Direction.Down, // S
    65: Direction.Left  // A
};

// R key restarts the game
let restartKeyStroke = 82;

class Move {
    public direction: Direction;
    constructor(direction: Direction) {
    // constructor(public direction: Direction) {
        this.direction = direction;
    }
}

class Restart {}

class KeepPlaying {}

// TODO: how can I use interfaces with unions? 
// type Move = {move: boolean, direction: Direction};
// type Restart = {restart: boolean};
// type KeepPlaying = {keepPlaying: boolean}

type BoardEvent = Move | Restart | KeepPlaying;

class TsKeyboardInputManager {
    boardEventHandler: (event: BoardEvent) => void;
    eventTouchstart: string;
    eventTouchmove: string;
    eventTouchend: string;

    constructor(boardEventHandler: (BoardEvent) => void) {
        this.boardEventHandler = boardEventHandler;
        
        this.initEventNames();
        this.listen();
    }
    
    private initEventNames()  {
        
        if (window.navigator.msPointerEnabled) {
            //Internet Explorer 10 style
            this.eventTouchstart = "MSPointerDown";
            this.eventTouchmove = "MSPointerMove";
            this.eventTouchend = "MSPointerUp";
            
        } else {
            this.eventTouchstart = "touchstart";
            this.eventTouchmove = "touchmove";
            this.eventTouchend = "touchend";
        }
    }
    
    private listen() {
        var self = this;
        // Respond to direction keys
        document.addEventListener("keydown", function (event: KeyboardEvent) {
            let modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                            event.shiftKey;
            let direction: Direction = keyboardMap[event.which];
    
            if (!modifiers) {
                if (direction !== undefined) {
                    self.raiseMove(event, direction);
                }
                else if (event.which == restartKeyStroke) {
                    // R key restarts the game
                    self.raiseRestart(event);
                }
            }
        });
    
        // Respond to button presses
        this.bindButtonPress(".retry-button", this.raiseRestart);
        this.bindButtonPress(".restart-button", this.raiseRestart);
        this.bindButtonPress(".keep-playing-button", this.raiseKeepPlaying);
    
        // Respond to swipe events
        var touchStartClientX, touchStartClientY;
        var gameContainer = document.getElementsByClassName("game-container")[0];
    
        // TODO: can't use Event for event argument, because all touch-stuff is not defined there!
        gameContainer.addEventListener(this.eventTouchstart, function (event: any) {
            // TODO HINT: this is a touch interface!!! Awesome!
            // Switched to square brackets to remove squigglies from TypeScript!
            // It seems that some package is missing???
            if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
                event.targetTouches > 1) {
                return; // Ignore if touching with more than 1 finger
            }
    
            if (window.navigator.msPointerEnabled) {
                touchStartClientX = event.pageX;
                touchStartClientY = event.pageY;
            } else {
                touchStartClientX = event.touches[0].clientX;
                touchStartClientY = event.touches[0].clientY;
            }
    
            // TODO: was here! But dont think it needed!
            event.preventDefault();
        });
    
        gameContainer.addEventListener(this.eventTouchmove, function (event: Event) {
            event.preventDefault();
        });
    
        gameContainer.addEventListener(this.eventTouchend, function (event: any) {
            if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
                event.targetTouches > 0) {
                return; // Ignore if still touching with one or more fingers
            }
    
            var touchEndClientX, touchEndClientY;
    
            if (window.navigator.msPointerEnabled) {
                touchEndClientX = event.pageX;
                touchEndClientY = event.pageY;
            } else {
                touchEndClientX = event.changedTouches[0].clientX;
                touchEndClientY = event.changedTouches[0].clientY;
            }
    
            var dx = touchEndClientX - touchStartClientX;
            var absDx = Math.abs(dx);
    
            var dy = touchEndClientY - touchStartClientY;
            var absDy = Math.abs(dy);
    
            if (Math.max(absDx, absDy) > 10) {
                // (right : left) : (down : up)
                let direction = absDx > absDy ? (dx > 0 ? Direction.Right : Direction.Left) : (dy > 0 ? Direction.Down : Direction.Up);
                self.raiseMove(event, direction);
            }
        });
    };

    private raise(event: Event, boardEvent: BoardEvent) {
        event.preventDefault();
        this.boardEventHandler(boardEvent);
    }

    raiseMove(event: Event, direction: Direction) {
        // this.raise(event, {move: true, direction: direction});
        this.raise(event, new Move(direction));
    }

    raiseRestart(event: Event) {
        // this.raise(event, {restart: true});
        this.raise(event, new Restart());
    };

    raiseKeepPlaying(event: Event) {
        // this.raise(event, {keepPlaying: true});
        this.raise(event, new KeepPlaying());
    };
    
    bindButtonPress(selector, fn) {
        var button = document.querySelector(selector);
        button.addEventListener("click", fn.bind(this));
        button.addEventListener(this.eventTouchend, fn.bind(this));
    };
}
