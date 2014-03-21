define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItemCreator/widgets/interactions/orderInteraction/states/Question',
    'taoQtiItemCreator/widgets/interactions/orderInteraction/states/Answer'
], function(factory, states){
    return factory.createBundle(states, arguments);
});