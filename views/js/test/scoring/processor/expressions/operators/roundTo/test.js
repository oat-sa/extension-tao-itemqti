define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/roundTo'
], function(_, roundToProcessor){
    'use strict';

    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(roundToProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(roundToProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(roundToProcessor.operands), 'the processor has a process function');
    });


    module('Process');

    var dataProvider = [{
        title : 'integers',
        roundingMode: roundToProcessor.engines.significantFigures,
        figures: 3,
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value : '20.1145'
        }],
        expectedResult : {
            cardinality : 'single',
            baseType : 'float',
            value : 20.115
        }
    },{
        title : 'incorrect settings',
        roundingMode: roundToProcessor.engines.significantFigures,
        figures: 0,
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value : 12.111
        }],
        expectedResult : null
    },{
        title : 'incorrect settings',
        roundingMode: roundToProcessor.engines.significantFigures,
        figures: 'string',
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value : 12.111
        }],
        expectedResult : null
    },{
        title : 'integers',
        roundingMode: roundToProcessor.engines.decimalPlaces,
        figures: 3,
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value : '20.1145'
        }],
        expectedResult : {
            cardinality : 'single',
            baseType : 'float',
            value : 20.114
        }
    },{
        title : 'one null',
        roundingMode: roundToProcessor.engines.significantFigures,
        figures: 3,
        operands : [{
            cardinality : 'single',
            baseType : 'integer',
            value : 5
        }, null],
        expectedResult : null
    },{
        title : '+Inf',
        roundingMode: roundToProcessor.engines.significantFigures,
        figures: 3,
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value : Infinity
        }],
        expectedResult : {
            cardinality : 'single',
            baseType : 'float',
            value : Infinity
        }
    },{
        title : '-Inf',
        roundingMode: roundToProcessor.engines.significantFigures,
        figures: 3,
        operands : [{
            cardinality : 'single',
            baseType : 'float',
            value : -Infinity
        }],
        expectedResult : {
            cardinality : 'single',
            baseType : 'float',
            value : -Infinity
        }
    }
    ];

    QUnit
      .cases(dataProvider)
      .test('roundTo ', function(data, assert){
        roundToProcessor.operands = data.operands;

        roundToProcessor.expression = {
            attributes: {
                figures: data.figures,
                roundingMode: data.roundingMode
            }
        };

        assert.deepEqual(roundToProcessor.process(), data.expectedResult, 'The roundTo is correct');
    });
});
