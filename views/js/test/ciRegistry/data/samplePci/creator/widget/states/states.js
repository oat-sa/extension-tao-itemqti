define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'samplePci/creator/widget/states/Question'
], function(factory, states){
    return factory.createBundle(states, arguments, ['answer', 'correct', 'map']);
});