define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/response'
], function(GraphicInteraction, responseHelper){
    'use strict';
    var HotspotInteraction = GraphicInteraction.extend({
        qtiClass : 'hotspotInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.choiceInteractionBased(this);
        }
    });
    return HotspotInteraction;
});

