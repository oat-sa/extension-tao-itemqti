define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/ResponseWidget',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response'
], function(stateFactory, Map, responseWidget, _, responseToolbarTpl){

    var AssociateInteractionStateCorrect = stateFactory.create(Map, function(){

        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        //init response widget in responseMapping mode:
        responseWidget.create(_widget, true);

        //start bind events to detect response changes:
        this.bindResponseChangeListener();

        //finally, apply defined correct response and response mapping:
        responseWidget.setResponse(interaction, _.values(response.getCorrect()));

    }, function(){

        this.widget.$container.off('responseChange.qti-widget');

        responseWidget.destroy(this.widget);

        this.widget.$container.find('.mini-tlb').remove();
    });

    AssociateInteractionStateCorrect.prototype.bindResponseChangeListener = function(){

        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        _widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(responseWidget.unformatResponse(data.response));
        });

        _widget.$container.find('.result-area')
            .on('keyup', '[data-role=score]', function(){
            var $score = $(this);
            response.setMapEntry($score.data('pairIdentifier'), $score.val());
        });
    };

    return AssociateInteractionStateCorrect;
});