define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'lodash'
], function(stateFactory, Correct, responseWidget, _){

    var InlineChoiceInteractionStateCorrect = stateFactory.create(Correct, function(){
        
        var response = this.widget.element.getResponseDeclaration();;
        
        //render commonRenderer.render()
        responseWidget.create(this.widget, false);
        
        //set response
        responseWidget.setResponse(_.values(response.getCorrect()));
        
        //save correct response on change
        this.widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(this.unformatResponse(data.response));
        });

    }, function(){
        
        this.widget.$container.off('responseChange.qti-widget');
        
        responseWidget.destroy(this.widget);
    });

    return InlineChoiceInteractionStateCorrect;
});