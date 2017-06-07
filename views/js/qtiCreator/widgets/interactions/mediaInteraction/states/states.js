define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/Sleep'
], function(factory, states){
    'use strict';
    return factory.createBundle(states, arguments, ['map']);
});
