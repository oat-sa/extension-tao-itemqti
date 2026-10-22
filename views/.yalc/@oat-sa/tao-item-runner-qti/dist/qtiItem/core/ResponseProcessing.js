define(['taoQtiItem/qtiItem/core/Element'], function (Element) { 'use strict';

    Element = Element && Object.prototype.hasOwnProperty.call(Element, 'default') ? Element['default'] : Element;

    var ResponseProcessing = Element.extend({
        qtiClass: 'responseProcessing',
        processingType: '',
        xml: '',
        toArray: function() {
            var arr = this._super();
            arr.processingType = this.processingType;
            arr.xml = this.xml;
            return arr;
        }
    });

    return ResponseProcessing;

});
