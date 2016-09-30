define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/states'
], function(factory, states){
    return factory.createBundle(states, arguments, ['answer', 'correct', 'map']);
});