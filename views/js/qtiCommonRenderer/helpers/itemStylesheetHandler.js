define([
    'jquery',
    'lodash'
], function($, _){
    'use strict';

    var itemStylesheetHandler = (function(){

        var attach = function(stylesheets) {
            var head = $('head'), link;

             $('body').addClass('tao-scope');

            _(stylesheets).forEach(function(stylesheet){
                link = (function() {
                    var _link = $(stylesheet.render()),
                        _href = _link.attr('href');
                    if(_href.indexOf('/') === 0) {
                        _href = _href.slice(1);
                    }
                    _link.attr('href', _href);
                    return _link;
                }());
                head.append(link);
            });

        };

        return {
            attach: attach
        }

    }());

    return itemStylesheetHandler;
});
