define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiItem/helper/interactionHelper',
    'lodash',
], function(stateFactory, Map, interactionHelper, _){

    var AssociateInteractionStateCorrect = stateFactory.create(Map, function(){

        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        _widget.$container.find('input[name=correct]').on('change.map', function(){
            response.setCorrect(interactionHelper.serialToIdentifier(interaction, $(this).val()));
        });

        _widget.$container.find('input[name=score]').on('keyup.map', function(){
            var score = parseFloat($(this).val());
            if(!isNaN(score)){
                response.setMapEntry(interactionHelper.serialToIdentifier(interaction, $(this).data('for')), score);
            }
        });

    }, function(){
        
        this.widget.$container.find('input').off('.map');
    });


    return AssociateInteractionStateCorrect;
});