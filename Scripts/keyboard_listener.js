/// <reference path="Contract.ts"/>
/// <reference path="state.ts"/>
var Keyboard;
(function (Keyboard) {
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
    // 'R' key restarts the game
    var restartKeyStroke = 82;
    var enterKeyStroke = 13;
    var Move = (function () {
        function Move(direction) {
            this.direction = direction;
        }
        return Move;
    })();
    Keyboard.Move = Move;
    var Restart = (function () {
        function Restart() {
        }
        return Restart;
    })();
    Keyboard.Restart = Restart;
    var EnterPress = (function () {
        function EnterPress() {
        }
        return EnterPress;
    })();
    Keyboard.EnterPress = EnterPress;
    var NextLevel = (function () {
        function NextLevel() {
        }
        return NextLevel;
    })();
    Keyboard.NextLevel = NextLevel;
    function createKeyboard() {
        return new KeyboardListenerImpl();
    }
    Keyboard.createKeyboard = createKeyboard;
    var KeyboardListenerImpl = (function () {
        function KeyboardListenerImpl() {
            this.touchEvents = this.createTouchEventNames();
            this.listen();
        }
        KeyboardListenerImpl.prototype.subscribe = function (handler) {
            Contract.requires(notNull(handler), 'Handler should be valid');
            this.eventHandler = handler;
        };
        KeyboardListenerImpl.prototype.createTouchEventNames = function () {
            if (window.navigator.msPointerEnabled) {
                //Internet Explorer 10 style
                return {
                    start: "MSPointerDown",
                    move: "MSPointerMove",
                    end: "MSPointerUp"
                };
            }
            return {
                start: "touchstart",
                move: "touchmove",
                end: "touchend"
            };
        };
        KeyboardListenerImpl.prototype.listen = function () {
            var _this = this;
            document.addEventListener("keydown", function (event) {
                var modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
                var direction = keyboardMap[event.which];
                if (!modifiers) {
                    if (direction !== undefined) {
                        _this.raiseMove(event, direction);
                    }
                    else if (event.which === restartKeyStroke) {
                        _this.raiseRestart(event);
                    }
                    else if (event.which === enterKeyStroke) {
                        _this.raiseEnterPress(event);
                    }
                }
            });
            // Respond to button presses
            this.bindButtonPress(".restart-button", this.raiseRestart);
            this.bindButtonPress(".next-level-button", this.raiseNextLevel);
            this.bindButtonPress(".retry-button", this.raiseRestart);
            // Respond to swipe events
            var touchStartClientX, touchStartClientY;
            var gameContainer = document.getElementsByClassName("game-container")[0];
            // TODO: can't use Event for event argument, because all touch-stuff is not defined there!
            gameContainer.addEventListener(this.touchEvents.start, function (event /*TouchEvent*/) {
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
            gameContainer.addEventListener(this.touchEvents.move, function (event) {
                event.preventDefault();
            });
            gameContainer.addEventListener(this.touchEvents.end, function (event /*TouchEvent*/) {
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
                    _this.raiseMove(event, direction);
                }
            });
        };
        KeyboardListenerImpl.prototype.raise = function (event, boardEvent) {
            event.preventDefault();
            // eventHandler can be null due to races in construction process
            if (this.eventHandler) {
                this.eventHandler(boardEvent);
            }
        };
        KeyboardListenerImpl.prototype.raiseMove = function (event, direction) {
            this.raise(event, new Move(direction));
        };
        KeyboardListenerImpl.prototype.raiseRestart = function (event) {
            this.raise(event, new Restart());
        };
        KeyboardListenerImpl.prototype.raiseNextLevel = function (event) {
            this.raise(event, new NextLevel());
        };
        KeyboardListenerImpl.prototype.raiseEnterPress = function (event) {
            this.raise(event, new EnterPress());
        };
        KeyboardListenerImpl.prototype.bindButtonPress = function (selector, fn) {
            var button = document.querySelector(selector);
            button.addEventListener("click", fn.bind(this));
            button.addEventListener(this.touchEvents.end, fn.bind(this));
        };
        return KeyboardListenerImpl;
    })();
})(Keyboard || (Keyboard = {}));
//# sourceMappingURL=keyboard_listener.js.map