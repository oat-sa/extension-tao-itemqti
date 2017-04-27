define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(BlockInteraction, maxScore){
    'use strict';
    var OrderInteraction = BlockInteraction.extend({
        qtiClass : 'orderInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.orderInteractionBased(this);
        }
    });
    return OrderInteraction;
});