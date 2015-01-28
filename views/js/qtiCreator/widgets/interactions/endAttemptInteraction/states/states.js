define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Question'
], function(factory, states){
    return factory.createBundle(states, arguments);
});