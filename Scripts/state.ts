/// <reference path="globals.ts"/>
/// <reference path="contract.ts"/>

module State {
    export const enum Direction {
        Up = 0,
        Right = 1,
        Down = 2,
        Left = 3,
    }

    export interface GameStatistic {
        bestScore: number;
    }

    export enum GameStatus {
        Victory,
        KeepPlaying,
        GameOver,
    }

    export interface GridState {
        size: number;
        cells: Array<TileState>; // Can't be null
    }

    export interface GameState {
        score: number;
        status: GameStatus;
        grid: GridState;
    }

    /**Tile value: 2, 4, ..., 2048, ...*/
    export type TileValue = number;

    export interface Cell {
        x: number;
        y: number;        
    }

    export function cellsAreEquals(left: Cell, right: Cell): boolean {
        return left.x === right.x && left.y === right.y;
    }

    export interface TileState extends Cell {
        value: TileValue;
    }

    export enum TileType {
        Old,
        New,
        Moved,
        Merged,
        Empty,
    }

    export interface Tile extends TileState {
        type: TileType;
        // Empty for Old/New, 1 cell for Moved, 1 or 2 cells for Merged
        origins?: Cell[];
    }

    // Helper namespace with additional functions for Tiles
    export module Tile {
        export function newTile(x: number, y: number, value: number): State.Tile {
            return { x: x, y: y, value: value, type: TileType.New };
        }

        export function moveTile(x: number, y: number, value: number, origin: Cell): State.Tile {
            Contract.requires(notNull(origin), "Origin cell should be defined");

            return { x: x, y: y, value: value, type: TileType.Moved, origins: [origin] };
        }

        export function emptyTile(x: number, y: number): State.Tile {
            return { x: x, y: y, value: undefined, type: TileType.Empty };
        }

        export function oldTile(x: number, y: number, value: number): State.Tile {
            return { x: x, y: y, value: value, type: TileType.Old };
        }

        export function cloneTile(tile: State.Tile): State.Tile {
            return { x: tile.x, y: tile.y, value: tile.value, type: tile.type, sourceCells: tile.origins };
        }

        export function mergeTiles(destination: Cell, value: number, ...origins: Cell[]): Tile {
            let sourceCells = origins.filter(f => notNull(f));

            Contract.assert(sourceCells.length >= 1, "For merged cells at least one source cell should be defined");

            return {
                x: destination.x,
                y: destination.y,
                value: value,
                type: TileType.Merged,
                origins: sourceCells
            };
        }

        export function hasMovesOrMerges(tiles: Tile[]): boolean {
            return tiles.some(t => t.type === TileType.Merged || t.type === TileType.Moved);
        }

        export function hasTileWithValue(tiles: Tile[], value: number) {
            return tiles.some(t => t && t.value === value);
        }

        export function match(
            tile: Tile,
            handler: {
                oldTile: (t: Tile) => void;
                newTile: (t: Tile) => void;
                movedTile: (t: Tile) => void;
                mergedTile: (t: Tile) => void;
            }) {

            switch (tile.type) {
                case TileType.Old:
                    handler.oldTile(tile);
                    break;
                case State.TileType.New:
                    handler.newTile(tile);
                    break;
                case TileType.Moved:
                    handler.movedTile(tile);
                    break;
                case TileType.Merged:
                    handler.mergedTile(tile);
                    break;
                default:
                    Contract.assert(false, `Unknown tile type '${tile.type}'`);
            }
        }

        export function computeScore(tiles: Tile[]): number {
            let result = 0;

            tiles.forEach(t => {
                if (t.type === TileType.Merged) {
                    result = result + <number>t.value;
                }
            });

            return result;
        }
    }
}