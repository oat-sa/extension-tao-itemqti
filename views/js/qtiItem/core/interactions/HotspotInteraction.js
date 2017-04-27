define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/maxScore'
], function(GraphicInteraction, maxScore){
    'use strict';
    var HotspotInteraction = GraphicInteraction.extend({
        qtiClass : 'hotspotInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return maxScore.choiceInteractionBased(this);
        }
    });
    return HotspotInteraction;
});

