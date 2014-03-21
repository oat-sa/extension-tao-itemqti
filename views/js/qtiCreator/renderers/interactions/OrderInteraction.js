define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
    'taoQtiItem/qtiCreator/widgets/interactions/orderInteraction/Widget'
], function(_, OrderInteraction, OrderInteractionWidget){

    var CreatorOrderInteraction = _.clone(OrderInteraction);

    CreatorOrderInteraction.render = function(interaction, data){

        //@todo: to be generalized:
        var $wrap = $('<div>', {'data-serial' : interaction.serial, 'class' : 'widget-box'});
        var $interactionContainer = $('[data-serial=' + interaction.serial + ']').wrap($wrap);
        var $container = $interactionContainer.parent();

        OrderInteractionWidget.build(interaction, $container, this.getOption('interactionOptionForm'), data);
    };

    return CreatorOrderInteraction;
});