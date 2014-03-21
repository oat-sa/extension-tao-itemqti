define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/states/states',
    'taoQtiItemCreator/widgets/choices/states/Sleep',
    'taoQtiItemCreator/widgets/choices/states/Active',
    'taoQtiItemCreator/widgets/choices/states/Question',
    'taoQtiItemCreator/widgets/choices/states/Answer'
], function(factory, states){
    return factory.createBundle(states, arguments);
});