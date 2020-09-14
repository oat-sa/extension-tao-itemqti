define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/matchInteraction/ResponseWidget',
    'lodash'
], function($, stateFactory, Map, responseWidget, _) {

    return stateFactory.create(Map, function() {

        const interactionContainer = this.widget;
        const interaction = interactionContainer.element;
        const response = interaction.getResponseDeclaration();
        const matchInteractionArea = $('.match-interaction-area input[type="checkbox"]', interactionContainer.$container);

        //init response widget in responseMapping mode:
        responseWidget.create(interactionContainer, true);

        //finally, apply defined correct response and response mapping:
        responseWidget.setResponse(interaction, _.values(response.getCorrect()));

        matchInteractionArea
            .prop('disabled', true)
            .prop('checked', false)
            .addClass('disabled');

       //change the correct state
        interactionContainer.on('metaChange', function(meta) {
            if (meta.key === 'defineCorrect') {
                if (meta.value) {
                    matchInteractionArea
                        .removeProp('disabled')
                        .removeClass('disabled');
                } else {
                    matchInteractionArea
                        .prop('disabled', true)
                        .prop('checked', false)
                        .addClass('disabled');
                    response.setCorrect([]);
                }
            }
        });

    }, function(){
        $('.match-interaction-area input[type="checkbox"]', this.widget.$container)
            .removeProp('disabled')
            .removeClass('disabled');
        responseWidget.destroy(this.widget);
    });
});
