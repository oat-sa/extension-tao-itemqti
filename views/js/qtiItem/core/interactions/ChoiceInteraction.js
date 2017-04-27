define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(BlockInteraction, maxScore){
    'use strict';
    var ChoiceInteraction = BlockInteraction.extend({
        qtiClass : 'choiceInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.choiceInteractionBased(this);
        }
    });
    return ChoiceInteraction;
});


