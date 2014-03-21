define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/states/states',
    'taoQtiItemCreator/widgets/interactions/blockInteraction/states/Active',
    'taoQtiItemCreator/widgets/interactions/blockInteraction/states/Question'
], function(factory, states){
    return factory.createBundle(states, arguments);
});