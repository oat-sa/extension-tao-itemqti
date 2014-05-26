define([
    'jquery',
    'lodash'
], function($, _){
    'use strict';

    var itemStylesheetHandler = (function(){

        var attach = function(stylesheets) {
            var head = $('head');

             $('body').addClass('tao-scope');

            _(stylesheets).forEach(function(stylesheet){
                head.append($(stylesheet.render()));
            });

        };

        return {
            attach: attach
        }

    }());

    return itemStylesheetHandler;
});
