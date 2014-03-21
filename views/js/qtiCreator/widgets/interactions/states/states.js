define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/states/states',
    'taoQtiItemCreator/widgets/interactions/states/Sleep',
    'taoQtiItemCreator/widgets/interactions/states/Question',
    'taoQtiItemCreator/widgets/interactions/states/Choice',
    'taoQtiItemCreator/widgets/interactions/states/Answer',
    'taoQtiItemCreator/widgets/interactions/states/Correct',
    'taoQtiItemCreator/widgets/interactions/states/Map'
], function(factory, states){
    return factory.createBundle(states, arguments);
});