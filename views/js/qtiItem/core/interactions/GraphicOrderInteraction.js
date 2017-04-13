define([
    'taoQtiItem/qtiItem/core/interactions/GraphicInteraction',
    'taoQtiItem/qtiItem/helper/response'
], function(GraphicInteraction, responseHelper){
    var GraphicOrderInteraction = GraphicInteraction.extend({
        qtiClass : 'graphicOrderInteraction',
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.orderInteractionBased(this);
        }
    });
    return GraphicOrderInteraction;
});

