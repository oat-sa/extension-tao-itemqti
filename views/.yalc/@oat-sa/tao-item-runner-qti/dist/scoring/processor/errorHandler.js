define(['lodash'], function (_) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;

    //TODO comment out and raise to tao-core

    var errorHandlerContext = function() {

        var typedHandlers = {};
        var globalHandler;

        return {
            'listen': function listenError(type, handler) {
                if (_.isFunction(type) && !handler) {
                    handler = type;
                }
                if (_.isFunction(handler)) {
                    if (_.isString(type) && !_.isEmpty(type)) {
                        typedHandlers[type] = handler;
                    } else {
                        globalHandler = handler;
                    }
                }
            },
            'throw': function throwError(err) {
                if (_.isString(err)) {
                    err = new Error(err);
                }
                if (_.isFunction(typedHandlers[err.name])) {
                    typedHandlers[err.name](err);
                }
                if (_.isFunction(globalHandler)) {
                    globalHandler(err);
                }
                return false;
            }
        };
    };

    var errorHandler = {
        _contexts: {},

        getContext: function getErrorContext(name) {
            if (_.isString(name) && name.length) {
                this._contexts[name] = this._contexts[name] || errorHandlerContext();
                return this._contexts[name];
            }
        },

        'listen': function listenInContext(name, ...args) {
            var context = this.getContext(name);
            if (context) {
                context.listen(...args);
            }
        },

        'throw': function throwInContext(name, err) {
            var context = this.getContext(name);
            if (context) {
                return context.throw(err);
            }
        },

        reset: function resetContext(name) {
            if (this._contexts[name]) {
                this._contexts = _.omit(this._contexts, name);
            }
        }
    };

    return errorHandler;

});
