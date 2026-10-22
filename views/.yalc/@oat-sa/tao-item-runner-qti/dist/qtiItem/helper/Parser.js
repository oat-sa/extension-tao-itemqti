define(['jquery'], function ($) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;

    /**
     * Experimental parser
     *
     */

    var Parser = function() {
        var _$xml = null;
        this.loadXML = function(xml) {
            _$xml = $.parseXML(xml);
        };
        this.getDOM = function() {
            return _$xml;
        };
    };

    return Parser;

});
