/// <reference path="game_manager.ts"/>
var keyboardMap = {
    38: 0 /* Up */,
    39: 1 /* Right */,
    40: 2 /* Down */,
    37: 3 /* Left */,
    75: 0 /* Up */,
    76: 1 /* Right */,
    74: 2 /* Down */,
    72: 3 /* Left */,
    87: 0 /* Up */,
    68: 1 /* Right */,
    83: 2 /* Down */,
    65: 3 /* Left */ // A
};
// R key restarts the game
var restartKeyStroke = 82;
var Move = (function () {
    function Move(direction) {
        // constructor(public direction: Direction) {
        this.direction = direction;
    }
    return Move;
})();
var Restart = (function () {
    function Restart() {
    }
    return Restart;
})();
var KeepPlaying = (function () {
    function KeepPlaying() {
    }
    return KeepPlaying;
})();
var TsKeyboardInputManager = (function () {
    function TsKeyboardInputManager(boardEventHandler) {
        this.boardEventHandler = boardEventHandler;
        this.initEventNames();
        this.listen();
    }
    TsKeyboardInputManager.prototype.initEventNames = function () {
        if (window.navigator.msPointerEnabled) {
            //Internet Explorer 10 style
            this.eventTouchstart = "MSPointerDown";
            this.eventTouchmove = "MSPointerMove";
            this.eventTouchend = "MSPointerUp";
        }
        else {
            this.eventTouchstart = "touchstart";
            this.eventTouchmove = "touchmove";
            this.eventTouchend = "touchend";
        }
    };
    TsKeyboardInputManager.prototype.listen = function () {
        var self = this;
        // Respond to direction keys
        document.addEventListener("keydown", function (event) {
            var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                event.shiftKey;
            var direction = keyboardMap[event.which];
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
        gameContainer.addEventListener(this.eventTouchstart, function (event) {
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
            }
            else {
                touchStartClientX = event.touches[0].clientX;
                touchStartClientY = event.touches[0].clientY;
            }
            // TODO: was here! But dont think it needed!
            event.preventDefault();
        });
        gameContainer.addEventListener(this.eventTouchmove, function (event) {
            event.preventDefault();
        });
        gameContainer.addEventListener(this.eventTouchend, function (event) {
            if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
                event.targetTouches > 0) {
                return; // Ignore if still touching with one or more fingers
            }
            var touchEndClientX, touchEndClientY;
            if (window.navigator.msPointerEnabled) {
                touchEndClientX = event.pageX;
                touchEndClientY = event.pageY;
            }
            else {
                touchEndClientX = event.changedTouches[0].clientX;
                touchEndClientY = event.changedTouches[0].clientY;
            }
            var dx = touchEndClientX - touchStartClientX;
            var absDx = Math.abs(dx);
            var dy = touchEndClientY - touchStartClientY;
            var absDy = Math.abs(dy);
            if (Math.max(absDx, absDy) > 10) {
                // (right : left) : (down : up)
                var direction = absDx > absDy ? (dx > 0 ? 1 /* Right */ : 3 /* Left */) : (dy > 0 ? 2 /* Down */ : 0 /* Up */);
                self.raiseMove(event, direction);
            }
        });
    };
    ;
    TsKeyboardInputManager.prototype.raise = function (event, boardEvent) {
        event.preventDefault();
        this.boardEventHandler(boardEvent);
    };
    TsKeyboardInputManager.prototype.raiseMove = function (event, direction) {
        // this.raise(event, {move: true, direction: direction});
        this.raise(event, new Move(direction));
    };
    TsKeyboardInputManager.prototype.raiseRestart = function (event) {
        // this.raise(event, {restart: true});
        this.raise(event, new Restart());
    };
    ;
    TsKeyboardInputManager.prototype.raiseKeepPlaying = function (event) {
        // this.raise(event, {keepPlaying: true});
        this.raise(event, new KeepPlaying());
    };
    ;
    TsKeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
        var button = document.querySelector(selector);
        button.addEventListener("click", fn.bind(this));
        button.addEventListener(this.eventTouchend, fn.bind(this));
    };
    ;
    return TsKeyboardInputManager;
})();
//# sourceMappingURL=keyboard_input_manager.js.map