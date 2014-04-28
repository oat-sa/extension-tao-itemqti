define([
    'lodash',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/ResponseWidget',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse'
], function(_, stateFactory, Correct, HotspotInteraction, responseWidget, PciResponse){

    var HotspotInteractionStateCorrect = stateFactory.create(Correct, function(){

        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();

        responseWidget.destroy(widget); 
        responseWidget.create(widget, false); 

        responseWidget.setResponse(interaction, PciResponse.serialize(_.values(response.getCorrect()), interaction));

        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            console.log('Response has changed', PciResponse.unserialize(data, interaction));
            
            response.setCorrect(PciResponse.unserialize(data, interaction)); 
        });

    }, function(){

        //stop listening responses changes
        this.widget.$container.off('responseChange.qti-widget');
        
        //destroy the common renderer
        responseWidget.destroy(this.widget); 

        //initialize again the widget's paper
        this.widget.createPaper();
    });

    return HotspotInteractionStateCorrect;
});
