define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/patternMatch'
], function (_, patternMatchProcessor) {
    'use strict';

    module('API');

    QUnit.test('structure', function (assert) {
        assert.ok(_.isPlainObject(patternMatchProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(patternMatchProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(patternMatchProcessor.operands), 'the processor has a process function');
    });


    module('Process');

    var dataProvider = [{
        title: 'match',
        pattern: /ain/,
        operands: [{
            cardinality: 'single',
            baseType: 'string',
            value: 'The rain in'
        }],
        expectedResult: {
            cardinality: 'single',
            baseType: 'boolean',
            value: true
        }
    },
        {
            title: 'don\'t match',
            pattern: /car/,
            operands: [{
                cardinality: 'single',
                baseType: 'string',
                value: 'The rain in'
            }],
            expectedResult: {
                cardinality: 'single',
                baseType: 'boolean',
                value: false
            }
        }, {
            title: 'error in regexp',
            pattern: 'error',
            operands: [{
                cardinality: 'single',
                baseType: 'string',
                value: 'The rain in'
            }],
            expectedResult: null
        }, {
            title: 'one null',
            pattern: /car/,
            operands: [null],
            expectedResult: null
        }
    ];

    QUnit
        .cases(dataProvider)
        .test('patternMatch ', function (data, assert) {
            patternMatchProcessor.operands = data.operands;
            patternMatchProcessor.expression = { attributes : { pattern : data.pattern } };
            assert.deepEqual(patternMatchProcessor.process(), data.expectedResult, 'The patternMatch is correct');
        });
});
