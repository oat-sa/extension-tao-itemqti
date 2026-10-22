define(['taoQtiItem/qtiItem/core/interactions/BlockInteraction'], function (InlineInteraction) { 'use strict';

    InlineInteraction = InlineInteraction && Object.prototype.hasOwnProperty.call(InlineInteraction, 'default') ? InlineInteraction['default'] : InlineInteraction;

    var UploadInteraction = InlineInteraction.extend({
        qtiClass: 'uploadInteraction',
        getNormalMaximum() {
            return 0;
        }
    });

    return UploadInteraction;

});
