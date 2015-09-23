/// <reference path="Contract.ts"/>
/// <reference path="state.ts"/>

module Keyboard {
    // TODO: fix remaining issues with any types!!

    import Direction = State.Direction;

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
        65: Direction.Left // A
    };

    // 'R' key restarts the game
    let restartKeyStroke = 82;

    let enterKeyStroke = 13;

    export class Move {
        constructor(public direction: Direction) {}
    }

    export class Restart { }

    export class EnterPress {}

    export class NextLevel {}

    export type InputEvent = Move | Restart | NextLevel | EnterPress;

    export interface KeyboardListener {
        subscribe(handler: (event: InputEvent) => void): void;
    }

    export function createKeyboard(): KeyboardListener {
        return new KeyboardListenerImpl();
    }

    class KeyboardListenerImpl implements KeyboardListener {
        private eventHandler: (event: InputEvent) => void;

        private touchEvents: {
            start: string,
            move: string,
            end: string,
        }

        constructor() {
            this.touchEvents = this.createTouchEventNames();
            this.listen();
        }

        public subscribe(handler: (event: KeyboardEvent) => void): void {
            Contract.requires(notNull(handler), 'Handler should be valid');

            this.eventHandler = handler;
        }

        private createTouchEventNames() {
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
        }

        private listen() { // Respond to direction keys

            document.addEventListener("keydown", (event: KeyboardEvent) => {
                let modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
                let direction: Direction = keyboardMap[event.which];

                if (!modifiers) {
                    if (direction !== undefined) {
                        this.raiseMove(event, direction);
                    } else if (event.which === restartKeyStroke) {
                        this.raiseRestart(event);
                    } else if (event.which === enterKeyStroke) {
                        this.raiseEnterPress(event);
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
            gameContainer.addEventListener(this.touchEvents.start, (event: any/*TouchEvent*/) => {
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

            gameContainer.addEventListener(this.touchEvents.move, (event: TouchEvent) => {
                event.preventDefault();
            });

            gameContainer.addEventListener(this.touchEvents.end, (event: any/*TouchEvent*/) => {
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
                    this.raiseMove(event, direction);
                }
            });
        }

        private raise(event: Event, boardEvent: InputEvent) {
            event.preventDefault();

            // eventHandler can be null due to races in construction process
            if (this.eventHandler) {
                this.eventHandler(boardEvent);
            }
        }

        private raiseMove(event: Event, direction: Direction) {
            this.raise(event, new Move(direction));
        }

        private raiseRestart(event: Event) {
            this.raise(event, new Restart());
        }

        private raiseNextLevel(event: Event) {
            this.raise(event, new NextLevel());
        }

        private raiseEnterPress(event: Event) {
            this.raise(event, new EnterPress());
        }

        private bindButtonPress(selector, fn) {
            var button = document.querySelector(selector);
            button.addEventListener("click", fn.bind(this));
            button.addEventListener(this.touchEvents.end, fn.bind(this));
        }
    }
}