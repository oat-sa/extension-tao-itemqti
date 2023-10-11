define([], function(){
    'use strict';

    return function EventMgr(){

        var events = {};

        this.get = function get(event){
            if (event && events[event]) {
                if (Array.isArray(events[event])) {
                    return events[event].slice();
                } else if (typeof events[event] === 'object' && events[event] !== null) {
                    return Object.assign({}, events[event]);
                }
            }
            return [];
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
                _.forEach(events[event], function(e){
                    e.callback.apply({
                        type : event,
                        ns : []
                    }, data);
                });
            }
        };
    };
});