define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/mapResponse'
], function(_, mapResponseProcessor){

    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(mapResponseProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(mapResponseProcessor.process), 'the processor has a process function');
    });

    module('Process');

});
