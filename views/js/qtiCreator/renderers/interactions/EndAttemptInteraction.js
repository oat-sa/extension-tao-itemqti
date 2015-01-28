define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/EndAttemptInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/endAttemptInteraction/Widget',
    'tpl!taoQtiItem/qtiCreator/tpl/inlineInteraction/endAttemptInteraction.placeholder'
], function($, _, EndAttemptInteraction, EndAttemptInteractionWidget, tpl){

    var CreatorEndAttemptInteraction = _.clone(EndAttemptInteraction);

    CreatorEndAttemptInteraction.template = tpl;

    CreatorEndAttemptInteraction.render = function(interaction, options){

        //need to pass choice option form to the interaction widget because it will manage everything
        options = options || {};
        
        return EndAttemptInteractionWidget.build(
            interaction,
            $('.endAttemptInteraction-placeholder[data-serial="' + interaction.serial + '"]'),
            this.getOption('interactionOptionForm'),
            this.getOption('responseOptionForm'),
            options
        );
    };

    return CreatorEndAttemptInteraction;
});
