///// <reference path="state.ts"/>
//module State {
//    // TODO: add namespace to avoid Tile suffix for Position type!
//    export interface TilePosition {
//        x: number;
//        y: number;
//    }
//    export class Tile {
//        public x: number;
//        public y: number;
//        public value: number;
//        public previousPosition: TilePosition;
//        public getPreviousOrCurrentPosition(): TilePosition {
//            return this.previousPosition || { x: this.x, y: this.y };
//        }
//        // TODO: next step - wrap this into methods and hide away!
//        public mergedFrom: any;
//        constructor(position: TilePosition, value: number) {
//            this.x = position.x;
//            this.y = position.y;
//            this.value = value || 2;
//        }
//        saveCurrentPositionAsPrevious(): void {
//            // Not sure why, but those two operations are always in pair!
//            this.mergedFrom = null;
//            this.previousPosition = {
//                x: this.x,
//                y: this.y
//            }
//        }
//        updatePosition(position: TilePosition): void {
//            this.x = position.x;
//            this.y = position.y;
//        }
//        serialize(): TileState {
//            return {
//                //position: {
//                    x: this.x,
//                    y: this.y,
//                //},
//                value: this.value
//            };
//        }
//        getValue(): number {
//            return this.value;
//        }
//        getX(): number {
//            return this.x;
//        }
//        getY(): number {
//            return this.y;
//        }
//    }
//} 
//# sourceMappingURL=tile.js.map