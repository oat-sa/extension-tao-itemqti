define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/delete'
], function(_, deleteProcessor){
    'use strict';
    
    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(deleteProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(deleteProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(deleteProcessor.operands), 'the processor has operands');
    });

    module('Process');

    var dataProvider = [{
        title : 'multiple',
        operands : [{
            cardinality : 'single',
            baseType : 'integer',
            value: 2
        },{
            cardinality : 'multiple',
            baseType : 'integer',
            value: [7, 2, 3, 2]
        }],
        expectedResult : {
            cardinality : 'multiple',
            baseType : 'integer',
            value: [7, 3].sort()
        }
    },{
        title : 'ordered',
        operands : [{
            cardinality : 'single',
            baseType : 'integer',
            value: 2
        },{
            cardinality : 'ordered',
            baseType : 'integer',
            value: [7, 2, 3, 2]
        }],
        expectedResult : {
            cardinality : 'ordered',
            baseType : 'integer',
            value: [7, 3]
        }
    },{
        title : 'incorrect baseType',
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value: 2
        },{
            cardinality : 'multiple',
            baseType : 'integer',
            value: [7, 2, 3, 2]
        }],
        expectedResult : null
    },{
        title : 'incorrect cardinality',
        operands : [{
            cardinality : 'single',
            baseType : 'integer',
            value: 2
        },{
            cardinality : 'single',
            baseType : 'integer',
            value: [7, 2, 3, 2]
        }],
        expectedResult : null
    },{
        title : 'null operand',
        operands : [null],
        expectedResult : null
    }];

    QUnit
      .cases(dataProvider)
      .test('delete ', function(data, assert){
        deleteProcessor.operands = data.operands;
        assert.deepEqual(deleteProcessor.process(), data.expectedResult, 'The delete is correct');
    });
});
