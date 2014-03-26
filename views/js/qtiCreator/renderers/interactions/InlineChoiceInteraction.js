define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/orderInteraction/Widget'
], function(_, InlineChoiceInteraction, InlineChoiceInteractionWidget){

    var CreatorInlineChoiceInteraction = _.clone(InlineChoiceInteraction);

    CreatorInlineChoiceInteraction.render = function(interaction, options){

        InlineChoiceInteraction.render(interaction);
        return;
        //need to pass choice option form to the interaction widget because it will manage everything
        options = options || {};
        options.choiceOptionForm = this.getOption('choiceOptionForm');

        InlineChoiceInteractionWidget.build(
            interaction,
            InlineChoiceInteraction.getContainer(interaction),
            this.getOption('interactionOptionForm'),
            options
            );
    };

    return CreatorInlineChoiceInteraction;
});