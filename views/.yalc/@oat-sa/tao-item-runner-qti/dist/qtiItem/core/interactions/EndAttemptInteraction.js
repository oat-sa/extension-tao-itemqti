define(['taoQtiItem/qtiItem/core/interactions/InlineInteraction'], function (InlineInteraction) { 'use strict';

    InlineInteraction = InlineInteraction && Object.prototype.hasOwnProperty.call(InlineInteraction, 'default') ? InlineInteraction['default'] : InlineInteraction;

    var EndAttemptInteraction = InlineInteraction.extend({
        qtiClass: 'endAttemptInteraction',
        getNormalMaximum() {
            return 0;
        }
    });

    return EndAttemptInteraction;

});
