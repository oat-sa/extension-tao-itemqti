define(['taoQtiItem/qtiItem/core/interactions/ContainerInteraction', 'taoQtiItem/qtiItem/core/Element'], function(ContainerInteraction, Element){
    var HottextInteraction = ContainerInteraction.extend({
        qtiClass : 'hottextInteraction',
        getChoices : function(){
            return this.getBody().getElements('Hottext');
        }
    });
    return HottextInteraction;
});


