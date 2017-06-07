define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/uploadInteraction/states/Question'
], function(factory, states){
    //remove map state, which does not make much sense for response with the basetype "file"
    return factory.createBundle(states, arguments, ['map']);
});