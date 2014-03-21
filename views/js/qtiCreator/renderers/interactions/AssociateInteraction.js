define([
    'lodash',
    'taoQtiCommonRenderer/renderers/interactions/AssociateInteraction',
    'taoQtiItemCreator/widgets/interactions/associateInteraction/Widget'
], function(_, AssociateInteraction, AssociateInteractionWidget){

    var CreatorAssociateInteraction = _.clone(AssociateInteraction);

    CreatorAssociateInteraction.render = function(interaction, data){

        //@todo: to be generalized:
        var $wrap = $('<div>', {'data-serial' : interaction.serial, 'class' : 'widget-box'});
        var $interactionContainer = $('[data-serial=' + interaction.serial + ']').wrap($wrap);
        var $container = $interactionContainer.parent();

        AssociateInteractionWidget.build(interaction, $container, this.getOption('interactionOptionForm'), data);
    };

    return CreatorAssociateInteraction;
});