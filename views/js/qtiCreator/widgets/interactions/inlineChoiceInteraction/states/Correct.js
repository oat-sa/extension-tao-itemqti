define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/ResponseWidget'
], function(stateFactory, Correct, responseWidget){

    var InlineChoiceInteractionStateCorrect = stateFactory.create(Correct, function(){

        var _widget = this.widget,
            response = this.widget.element.getResponseDeclaration();

        _widget.$container.find('table').hide();

        //render commonRenderer.render()
        responseWidget.create(_widget, false, function(){

            //set response
            responseWidget.setResponse(_widget, Object.values(response.getCorrect()));

            //save correct response on change
            _widget.$container.on('responseChange.qti-widget', function(e, data){
                response.setCorrect(responseWidget.unformatResponse(data.response));
            });
        });

    }, function(){

        var $container = this.widget.$container;
        $container.find('table').show();
        $container.off('responseChange.qti-widget');

        responseWidget.destroy(this.widget);
    });

    return InlineChoiceInteractionStateCorrect;
});
