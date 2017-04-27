define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(GraphicInteraction, maxScore){
    'use strict';
    var GraphicAssociateInteraction = GraphicInteraction.extend({
        qtiClass : 'graphicAssociateInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.associateInteractionBased(this);
        }
    });
    return GraphicAssociateInteraction;
});

