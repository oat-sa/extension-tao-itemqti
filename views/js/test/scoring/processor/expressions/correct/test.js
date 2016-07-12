define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/preprocessor',
    'taoQtiItem/scoring/processor/expressions/correct',
    'taoQtiItem/scoring/processor/errorHandler'
], function(_, preProcessorFactory, correctProcessor, errorHandler){
    'use strict';

    QUnit.module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(correctProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(correctProcessor.process), 'the processor has a process function');
    });

    QUnit.module('Process');

    var dataProvider = [{
        title : 'single identifier',
        response : {
            cardinality     : 'single',
            baseType        : 'identifier',
            value           : 'choice-2',
            correctResponse : 'choice-1'
        },
        expectedResult : {
            cardinality : 'single',
            baseType    : 'identifier',
            value       : 'choice-1'
        }
    }, {
        title : 'multiple integers',
        response : {
            cardinality     : 'multiple',
            baseType        : 'integer',
            value           : [4, 5],
            correctResponse : ['1', '2']
        },
        expectedResult : {
            cardinality : 'multiple',
            baseType    : 'integer',
            value       : [1, 2]
        }
    }, {
        title : 'no variable',
        response : undefined,
        expectedResult : null
    }, {
        title : 'null',
        response : {
            cardinality         : 'single',
            baseType            : 'identifier',
            value               : 'zhoice-2'
        },
        expectedResult : null
    }, {
        title : 'multiple directedPairs',
        response : {
            cardinality     : 'multiple',
            baseType        : 'directedPair',
            value           : [['C', 'R'], ['D', 'M']],
            correctResponse : [
                "C R",
                "D M",
                "L M",
                "P T"
            ],
        },
        expectedResult : {
            cardinality : 'multiple',
            baseType    : 'directedPair',
            value       : [
                ['C', 'R'],
                ['D', 'M'],
                ['L', 'M'],
                ['P', 'T']
            ]
        }
    }];

    QUnit
      .cases(dataProvider)
      .test('correct ', function(data, assert){
        var state = {
            RESPONSE : data.response
        };
        correctProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        correctProcessor.state = state;
        correctProcessor.preProcessor = preProcessorFactory(state);
        assert.deepEqual(correctProcessor.process(), data.expectedResult, 'The results match correct');
    });


});
