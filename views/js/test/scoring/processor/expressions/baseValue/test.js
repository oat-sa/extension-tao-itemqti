define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/baseValue'
], function(_, baseValueProcessor){

    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(baseValueProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(baseValueProcessor.process), 'the processor has a process function');
    });

    module('Process');

    var dataProvider = [{
        title : 'integer',
        expression : {
            attributes : { baseType : 'integer' },
            value : 5
        },
        expectedResult : {
            cardinality : 'single',
            baseType : 'integer',
            value : 5
        }
    }, {
        title : 'float',
        expression : {
            attributes : { baseType : 'float' },
            value : 0.75
        },
        expectedResult : {
            cardinality : 'single',
            baseType : 'float',
            value : 0.75
        }
    }];

    QUnit
      .cases(dataProvider)
      .test('baseValue ', function(data, assert){
        baseValueProcessor.expression = data.expression;
        assert.deepEqual(baseValueProcessor.process(), data.expectedResult, 'The baseValue is correct');
    });
});
