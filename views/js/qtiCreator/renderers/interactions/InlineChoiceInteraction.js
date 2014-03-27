define([
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/inlineChoiceInteraction.placeholder'
], function(InlineChoiceInteractionWidget, tpl){

    return {
        qtiClass : 'inlineChoiceInteraction',
        template : tpl,
        render : function(interaction, options){

            //need to pass choice option form to the interaction widget because it will manage everything
            options = options || {};
            options.choiceOptionForm = this.getOption('choiceOptionForm');

            InlineChoiceInteractionWidget.build(
                interaction,
                $('.widget-box-placeholder[data-serial="' + interaction.serial + '"]'),
                this.getOption('interactionOptionForm'),
                options
                );
        }
    };
});