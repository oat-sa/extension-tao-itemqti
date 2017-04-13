define([
    'taoQtiItem/qtiItem/core/interactions/ContainerInteraction',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/helper/response'
], function(ContainerInteraction, Element, responseHelper){
    'use strict';
    var HottextInteraction = ContainerInteraction.extend({
        qtiClass : 'hottextInteraction',
        getChoices : function(){
            return this.getBody().getElements('hottext');
        },
        getChoice : function(serial){
            var element = this.getBody().getElement(serial);
            return Element.isA(element, 'choice') ? element : null;
        },
        getNormalMaximum : function getNormalMaximum(){
            return responseHelper.choiceInteractionBased(this);
        }
    });
    return HottextInteraction;
});


