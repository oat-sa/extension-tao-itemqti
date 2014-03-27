define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/Widget'
], function(_, InlineChoiceInteraction, InlineChoiceInteractionWidget){

    var CreatorInlineChoiceInteraction = _.clone(InlineChoiceInteraction);

    CreatorInlineChoiceInteraction.render = function(interaction, options){

        InlineChoiceInteraction.render(interaction);
        
        //need to pass choice option form to the interaction widget because it will manage everything
        options = options || {};
        options.choiceOptionForm = this.getOption('choiceOptionForm');
        
        var $selectBox = InlineChoiceInteraction.getContainer(interaction);
        
        InlineChoiceInteractionWidget.build(
            interaction,
            $selectBox.prev('.select2-container'),
            this.getOption('interactionOptionForm'),
            options
            );
    };

    return CreatorInlineChoiceInteraction;
});