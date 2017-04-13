define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/response'
], function(BlockInteraction, responseHelper){
    'use strict';
    var ChoiceInteraction = BlockInteraction.extend({
        qtiClass : 'choiceInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.choiceInteractionBased(this);
        }
    });
    return ChoiceInteraction;
});


