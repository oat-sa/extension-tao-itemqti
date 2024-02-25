define(function() {
    'use strict';

    return function EventMgr() {
        const events = {};

        this.get = event => {
            if (event && events[event]) {
                return [...events[event]];
            } else {
                return [];
            }
        };

        this.on = (event, callback) => {
            let name;
            const tokens = event.split('.');
            if (tokens[0]) {
                name = tokens.shift();
                events[name] = events[name] || [];
                events[name].push({
                    ns: tokens,
                    callback: callback
                });
            }
        };

        this.off = event => {
            if (event && events[event]) {
                events[event] = [];
            }
        };

        this.trigger = (event, data) => {
            if (events[event]) {
                events[event].forEach(e => {
                    e.callback.apply({
                        type: event,
                        ns: []
                    }, data);
                });
            }
        };
    };
});
