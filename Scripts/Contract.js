function notNull(a) {
    return a !== null && a !== undefined;
}
var Contract = (function () {
    function Contract() {
    }
    Contract.requires = function (predicate, message) {
        if (Contract.enabled) {
            if (!predicate) {
                throw new Error("Precondition failed: '" + message + "'");
            }
        }
    };
    Contract.ensures = function (predicate, message) {
        if (Contract.enabled) {
            if (!predicate) {
                throw new Error("Postcondition failed: '" + message + "'");
            }
        }
    };
    Contract.assert = function (predicate, message) {
        if (Contract.enabled) {
            if (!predicate) {
                throw new Error("Assertion failed: '" + message + "'");
            }
        }
    };
    Contract.enabled = true;
    return Contract;
})();
//# sourceMappingURL=contract.js.map