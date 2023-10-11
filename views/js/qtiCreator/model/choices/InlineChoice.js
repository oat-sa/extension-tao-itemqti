define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiItem/core/choices/InlineChoice'
], function (editable, Choice) {
    'use strict';
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, {
        getDefaultAttributes: function () {
            return {
                fixed: false,
                showHide: 'show'
            };
        }
    });
    return Choice.extend(methods);
});
