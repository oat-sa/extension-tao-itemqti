define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/ResponseWidget',
    'lodash'
], function(stateFactory, Correct, responseWidget, _){

    var MatchInteractionStateCorrect = stateFactory.create(Correct, function(){
        
        var response = this.widget.element.getResponseDeclaration();
        
        responseWidget.create(this.widget, false);
        responseWidget.setResponse(_.values(response.getCorrect()));
        
        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(responseWidget.unformatResponse(data.response));
        });

    }, function(){
        
        this.widget.$container.off('responseChange.qti-widget');
        
        responseWidget.destroy(this.widget);
    });

    return MatchInteractionStateCorrect;
});
