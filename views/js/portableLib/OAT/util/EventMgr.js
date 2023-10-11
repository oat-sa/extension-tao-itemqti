define([], function(){
    'use strict';

    return function EventMgr(){

        var events = {};

        this.get = function get(event) {
            if (event && events[event]) {
                if (Array.isArray(events[event])) {
                    return [...events[event]];
                } else if (typeof events[event] === 'object') {
                    return Object.assign({}, events[event]);
                }
            } else {
                return [];
            }
        };

        this.on = function on(event, callback){
            var name;
            var tokens = event.split('.');
            if(tokens[0]){
                name = tokens.shift();
                events[name] = events[name] || [];
                events[name].push({
                    ns : tokens,
                    callback : callback
                });
            }
        };

        this.off = function off(event){
            if(event && events[event]){
                events[event] = [];
            }
        };

        this.trigger = function trigger(event, data){
            if(events[event]){
                if (events[event]) {
                    events[event].forEach(function(e) {
                        e.callback.apply({
                            type: event,
                            ns: []
                        }, data);
                    });
                }
            }
        };
    };
});