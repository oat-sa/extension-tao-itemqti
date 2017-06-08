define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Correct',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/inlineChoiceInteraction/states/NoRp'
], function(factory, states){
    'use strict';
    return factory.createBundle(states, arguments);
});