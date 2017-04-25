define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/response'
], function(GraphicInteraction, responseHelper){
    'use strict';
    var GraphicAssociateInteraction = GraphicInteraction.extend({
        qtiClass : 'graphicAssociateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.associateInteractionBased(this);
        }
    });
    return GraphicAssociateInteraction;
});

