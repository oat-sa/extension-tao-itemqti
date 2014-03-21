define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItemCreator/widgets/interactions/choiceInteraction/states/Question',
    'taoQtiItemCreator/widgets/interactions/choiceInteraction/states/Answer'
], function(factory, states){
    return factory.createBundle(states, arguments);
});