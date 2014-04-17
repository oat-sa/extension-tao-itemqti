define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/textEntryInteraction/states/Answer',
], function(factory, states){
    return factory.createBundle(states, arguments);
});