define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/ResponseWidget',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'
], function(_, stateFactory, Map, HotspotInteraction, responseWidget, PciResponse){

    var AssociateInteractionStateCorrect = stateFactory.create(Map, function(){

        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        responseWidget.destroy(widget); 
        responseWidget.create(widget, false); 

        responseWidget.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));

        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            console.log('Response has changed', PciResponse.unserialize(data, interaction));
            
            response.setCorrect(PciResponse.unserialize(data, interaction)); 
            response.setMapEntry('id', 'score');
        });

    }, function(){

        this.widget.$container.off('responseChange.qti-widget');
    });




    return AssociateInteractionStateCorrect;
});
