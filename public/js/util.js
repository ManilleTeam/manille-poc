'use strict';

var merge = function (src, dest) {
    Object.keys(src).forEach(function (key) {
        dest[key] = src[key];
    });
};
