define([
    'taoQtiCommonRenderer/renderers/interactions/ChoiceInteraction',
    'taoQtiItemCreator/widgets/interactions/choiceInteraction/Widget'
], function(Interaction, ChoiceInteractionWidget){
    return {
        qtiClass : 'choiceInteraction',
        template : Interaction.template,
        render : function(interaction, data){

            //@todo: to be generalized:
            var $wrap = $('<div>', {'data-serial' : interaction.serial, 'class' : 'widget-box'});
            var $interactionContainer = $('[data-serial=' + interaction.serial + ']').wrap($wrap);
            var $container = $interactionContainer.parent();

            ChoiceInteractionWidget.build(interaction, $container, this.getOption('interactionOptionForm'), data);
        }
    };
});