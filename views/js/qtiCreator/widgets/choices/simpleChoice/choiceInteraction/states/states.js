define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/choices/states/states',
    'taoQtiItemCreator/widgets/choices/simpleChoice/choiceInteraction/states/Choice'
], function(factory, states){
    return factory.createBundle(states, arguments);
});