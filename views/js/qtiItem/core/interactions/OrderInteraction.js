define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/response'
], function(BlockInteraction, responseHelper){
    'use strict';
    var OrderInteraction = BlockInteraction.extend({
        qtiClass : 'orderInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.orderInteractionBased(this);
        }
    });
    return OrderInteraction;
});