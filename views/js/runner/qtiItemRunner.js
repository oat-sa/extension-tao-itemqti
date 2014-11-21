define(['taoItems/runner/api/itemRunner', 'taoQtiItem/runner/provider/qti'], function(itemRunner, qtiRuntimeProvider){
    'use strict';
    itemRunner.register('qti', qtiRuntimeProvider);
    return itemRunner;
});
