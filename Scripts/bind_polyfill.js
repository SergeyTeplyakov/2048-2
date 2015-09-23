Function.prototype.bind = Function.prototype.bind || function (target) {
    var _this = this;
    return function (args) {
        if (!(args instanceof Array)) {
            args = [args];
        }
        _this.apply(target, args);
    };
};
//# sourceMappingURL=bind_polyfill.js.map