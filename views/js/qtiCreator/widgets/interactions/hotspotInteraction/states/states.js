define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Correct',
    'taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Map',
], function(factory, states){
    return factory.createBundle(states, arguments);
});
