// TODO: make all files consistent: utils.ts?
module Utils {

    export function forEach<T>(array: T[][], callback: (x, y, t: T) => void) {
        let length = array.length;
        for (let x = 0; x < length; x++) {
            let rowLength = array[x].length;

            for (let y = 0; y < rowLength; y++) {
                callback(x, y, array[x][y]);
            }
        }
    }
}