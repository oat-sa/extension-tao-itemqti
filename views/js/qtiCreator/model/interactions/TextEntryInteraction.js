define([
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/TextEntryInteraction',
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'
], function(_, editable, editableInteraction, Interaction, textEntryEvaluationHelper){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                base : 10,
                placeholderText : ''
            };
        },
        afterCreate : function(){
            this.createResponse({
                baseType:'string',
                cardinality:'single'
            });

            // Body order is already updated; move UMFI/scoring attrs onto the new first TEI.
            textEntryEvaluationHelper.migrateFeatureDataAttributesToPrimary(this);
        },
        createChoice : function(){
            throw new Error('text entry interaction has no choice');
        }
    });
    return Interaction.extend(methods);
});
