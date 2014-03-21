define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItemCreator/widgets/interactions/associateInteraction/states/Question',
    'taoQtiItemCreator/widgets/interactions/associateInteraction/states/Answer'
], function(factory, states){
    return factory.createBundle(states, arguments);
});