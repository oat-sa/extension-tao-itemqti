define(['taoQtiItem/core/interactions/BlockInteraction', 'taoQtiItem/mixin/Container'], function(BlockInteraction, Container){
    var ContainerInteraction = BlockInteraction.extend({});
    Container.augment(ContainerInteraction);
    return ContainerInteraction;
});



