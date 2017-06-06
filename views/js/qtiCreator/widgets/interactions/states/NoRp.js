define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/NoRp',
    'lodash'
], function(stateFactory, NoRp, _){
    'use strict';
    return stateFactory.create(NoRp, _.noop, _.noop);
});
