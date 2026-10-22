define(['taoQtiItem/qtiItem/core/IdentifiedElement'], function (IdentifiedElement) { 'use strict';

    IdentifiedElement = IdentifiedElement && Object.prototype.hasOwnProperty.call(IdentifiedElement, 'default') ? IdentifiedElement['default'] : IdentifiedElement;

    var Feedback = IdentifiedElement.extend({
        is: function(qtiClass) {
            return qtiClass === 'feedback' || this._super(qtiClass);
        }
    });

    return Feedback;

});
