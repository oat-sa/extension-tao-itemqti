define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/ResponseWidget',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiItem/helper/interactionHelper',
    'lodash',
], function($, stateFactory, Map, responseWidget, formElement, interactionHelper, _){

    var AssociateInteractionStateCorrect = stateFactory.create(Map, function(){

        var _widget = this.widget,
            $container = _widget.$container,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        $container.find('[data-edit=map]').show();

        //init correct response radio group:
        var correct = _.values(response.getCorrect());
        if(correct.length){
            var selectedChoice = interaction.getChoiceByIdentifier(correct.pop());
            if(selectedChoice){
                $container.find('input[name=correct][value="' + selectedChoice.serial + '"]').prop('checked', true);
            }
        }

        _.forEach(response.getMapEntries(), function(score, choice){
            var element = interaction.getChoiceByIdentifier(choice);
            if(element){
                $container.find('input[name=score][data-for="' + element.serial + '"]').val(score);
            }
        });

        formElement.setChangeCallbacks($container, response, {
            correct : function(response, value){
                response.setCorrect(interactionHelper.serialToIdentifier(interaction, value));
            },
            score : function(response, value){
                var score = parseFloat(value);
                if(!isNaN(score)){
                    response.setMapEntry(interactionHelper.serialToIdentifier(interaction, $(this).data('for')), score);
                }
            }
        });

        //render commonRenderer.render()
        responseWidget.create(_widget, true, function(){

            //set response
            responseWidget.setResponse(_widget, _.values(response.getCorrect()));

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


    return AssociateInteractionStateCorrect;
});
