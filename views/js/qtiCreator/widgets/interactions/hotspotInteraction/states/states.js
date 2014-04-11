define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Answer'
], function(factory, states){
    return factory.createBundle(states, arguments);
});
