// TODO: make all files consistent: utils.ts?
var Utils;
(function (Utils) {
    function forEach(array, callback) {
        var length = array.length;
        for (var x = 0; x < length; x++) {
            var rowLength = array[x].length;
            for (var y = 0; y < rowLength; y++) {
                callback(x, y, array[x][y]);
            }
        }
    }
    Utils.forEach = forEach;
})(Utils || (Utils = {}));
//# sourceMappingURL=Utils.js.map