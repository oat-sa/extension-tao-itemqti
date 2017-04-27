define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(BlockInteraction, maxScore){
    'use strict';
    var AssociateInteraction = BlockInteraction.extend({
        qtiClass : 'associateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.associateInteractionBased(this);
        }
    });
    return AssociateInteraction;
});


