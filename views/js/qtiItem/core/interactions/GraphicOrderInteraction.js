define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(GraphicInteraction, maxScore){
    'use strict';
    var GraphicOrderInteraction = GraphicInteraction.extend({
        qtiClass : 'graphicOrderInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.orderInteractionBased(this);
        }
    });
    return GraphicOrderInteraction;
});

