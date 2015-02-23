define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/index'
], function(_, indexProcessor){
    'use strict';
    
    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(indexProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(indexProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(indexProcessor.operands), 'the processor has operands');
    });

    module('Process');

    var dataProvider = [{
        title : 'exists',
        n: 3,
        operands : [{
            cardinality : 'ordered',
            baseType : 'integer',
            value: [2, 6, 9, 10]
        }],
        expectedResult : {
            cardinality : 'single',
            baseType : 'integer',
            value: 9
        }
    },{
        title : 'exists - n is reference',
        n: 'ref1',
        state: {
            ref1: {
                cardinality: 'single',
                baseType: 'integer',
                value: '3'
            }
        },
        operands : [{
            cardinality : 'ordered',
            baseType : 'integer',
            value: [2, 6, 9, 10]
        }],
        expectedResult : {
            cardinality : 'single',
            baseType : 'integer',
            value: 9
        }
    },{
        title : 'incorrect n',
        n: -1,
        operands : [{
            cardinality : 'ordered',
            baseType : 'integer',
            value: [2, 6, 9, 10]
        }],
        expectedResult : null
    },{
        title : 'n - out of the range ',
        n: 10,
        operands : [{
            cardinality : 'ordered',
            baseType : 'integer',
            value: [2, 6, 9, 10]
        }],
        expectedResult : null
    },{
        title : 'null operand',
        n: 2,
        operands : [null],
        expectedResult : null
    }];

    QUnit
      .cases(dataProvider)
      .test('index ', function(data, assert){
        indexProcessor.operands = data.operands;
        indexProcessor.state = data.state ? data.state : {};
        indexProcessor.expression = { attributes : { n : data.n } };
        assert.deepEqual(indexProcessor.process(), data.expectedResult, 'The index is correct');
    });
});
