'use strict';

var EventEmitter = function () {
    this.handlers = {};
};

EventEmitter.prototype.on = function (topic, handler) {
    if (!this.handlers.hasOwnProperty(topic)) {
        this.handlers[topic] = [];
    }
    this.handlers[topic].push(handler);
};

EventEmitter.prototype.off = function (topic, handler) {
    if (this.handlers.hasOwnProperty(topic)) {
        var index = this.handlers[topic].indexOf(handler);
        if (index !== -1) {
            this.handlers[topic].splice(index, 1);
        }
    }
};

EventEmitter.prototype.emit = function (topic, data) {
    if (this.handlers.hasOwnProperty(topic)) {
        this.handlers[topic].forEach(function (handler) {
            try {
                handler(data);
            } catch (ex) {
                console.error(ex);
            }
        })
    };
};
