define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/default',
    'taoQtiItem/scoring/processor/errorHandler'
], function(_, defaultProcessor, errorHandler){
    'use strict';

    QUnit.module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(defaultProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(defaultProcessor.process), 'the processor has a process function');
    });

    QUnit.module('Process');

    QUnit.test('Get the default value', function(assert){
        defaultProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        defaultProcessor.state = {
            RESPONSE : {
                cardinality         : 'single',
                baseType            : 'integer',
                correctResponse     : 11,
                mapping             : [],
                areaMapping         : [],
                value               : 2,
                defaultValue        : -1

            }
        };

        var expectedResult =  {
            cardinality : 'single',
            baseType : 'integer',
            value : -1
        };
        assert.deepEqual(defaultProcessor.process(), expectedResult, 'returns the default response');
    });

    QUnit.test('Get the default value even null', function(assert){
        defaultProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        defaultProcessor.state = {
            RESPONSE : null
        };

        assert.equal(defaultProcessor.process(), null, 'returns null');
    });

    QUnit.test('Return null if no variable is found', function(assert){
        QUnit.expect(1);
        defaultProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        defaultProcessor.state = {
            RESPONSE_1 : {
                cardinality         : 'single',
                baseType            : 'identifier',
                defaultResponse     : 'choice-1',
                mapping             : [],
                areaMapping         : [],
                value               : 'choice-2'
            }
        };

        assert.equal(defaultProcessor.process(), null, 'returns null');
    });

});
