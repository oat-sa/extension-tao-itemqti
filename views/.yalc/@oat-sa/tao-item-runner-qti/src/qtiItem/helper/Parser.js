/**
 * Experimental parser
 *
 */
import $ from 'jquery';

var Parser = function() {
    var _$xml = null;
    this.loadXML = function(xml) {
        _$xml = $.parseXML(xml);
    };
    this.getDOM = function() {
        return _$xml;
    };
};

export default Parser;
