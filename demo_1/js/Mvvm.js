"use strict";
var Mvvm = /** @class */ (function () {
    function Mvvm(_options) {
        var _this = this;
        this.$options = _options;
        this.$data = _options.data;
        observe(this.$data);
        var data = this.$data;
        Object.keys(data).forEach(function (key) {
            Object.defineProperty(_this, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    return this.$data[key];
                },
                set: function (newVal) {
                    this.$data[key] = newVal;
                }
            });
        });
        new Compile(_options.el, this.$data);
    }
    return Mvvm;
}());
var Observe = /** @class */ (function () {
    function Observe(_data) {
        this.data = _data;
        this.dep = new Dep();
        this.defineProperty();
    }
    Observe.prototype.defineProperty = function () {
        var that = this;
        Object.keys(that.data).forEach(function (elem) {
            var val = that.data[elem];
            observe(val);
            Object.defineProperty(that.data, elem, {
                enumerable: true,
                configurable: true,
                get: function () {
                    window.target && that.dep.depend(window.target);
                    return val;
                },
                set: function (newVal) {
                    if (newVal === val)
                        return;
                    val = newVal;
                    that.dep.notify();
                    observe(val);
                }
            });
        });
    };
    return Observe;
}());
var Compile = /** @class */ (function () {
    function Compile(_selector, _data) {
        this.el = document.querySelector(_selector);
        this.data = _data;
        var fragement = document.createDocumentFragment();
        var child = null;
        while ((child = this.el && this.el.firstChild))
            fragement.appendChild(child);
        this.replace(fragement);
        this.el && this.el.appendChild(fragement);
    }
    Compile.prototype.replace = function (frgmt) {
        var _this = this;
        var EXP = /\{\{(.*)\}\}/;
        frgmt.childNodes.forEach(function (node) {
            var text = node.textContent;
            if (node.nodeType === 3 && text && EXP.test(text)) {
                var watcher = new Watcher(_this.data, RegExp.$1, function (newVal) {
                    node.textContent = text && text.replace(EXP, newVal);
                });
                watcher.update();
            }
            if (node.childNodes)
                _this.replace(node);
        });
    };
    return Compile;
}());
function observe(_data) {
    if (typeof _data !== "object")
        return null;
    return new Observe(_data);
}
