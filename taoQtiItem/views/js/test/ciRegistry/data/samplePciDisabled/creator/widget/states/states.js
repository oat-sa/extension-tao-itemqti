define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'samplePciDisabled/creator/widget/states/Question'
], function(factory, states){
    return factory.createBundle(states, arguments, ['answer', 'correct', 'map']);
});