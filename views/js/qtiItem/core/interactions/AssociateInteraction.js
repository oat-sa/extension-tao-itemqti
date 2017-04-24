define([
    'taoQtiItem/qtiItem/core/interactions/BlockInteraction',
    'taoQtiItem/qtiItem/helper/response'
], function(BlockInteraction, responseHelper){
    'use strict';
    var AssociateInteraction = BlockInteraction.extend({
        qtiClass : 'associateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.associateInteractionBased(this);
        }
    });
    return AssociateInteraction;
});


