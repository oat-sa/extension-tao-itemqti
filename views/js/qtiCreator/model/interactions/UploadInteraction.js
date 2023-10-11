define([
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/UploadInteraction'
], function(editable, editableInteraction, Interaction) {
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableInteraction);
    Object.assign(methods, {
        getDefaultAttributes: function() {
            // The QTI uploadInteraction has a option
            // attribute 'type'
            // https://www.imsglobal.org/question/qti_v2p0/imsqti_infov2p0.html#element10350
            return {};
        },

        afterCreate: function() {
            // As per specs, a QTI uploadInteraction
            // is always bound to a response variable
            // with base-type file and single cardinality.
            this.createResponse({
                baseType:'file',
                cardinality:'single'
            });
        },

        createChoice: function() {
            throw 'uploadInteraction does not have any choices';
        }
    });

    return Interaction.extend(methods);
});


