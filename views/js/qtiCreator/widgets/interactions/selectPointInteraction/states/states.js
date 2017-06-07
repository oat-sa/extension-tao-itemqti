/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Sleep',
    'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/selectPointInteraction/states/Map'
], function(factory, states){
    'use strict';
    return factory.createBundle(states, arguments);
});
