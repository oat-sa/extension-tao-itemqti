define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/variable'
], function(_, variableProcessor){

    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(variableProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(variableProcessor.process), 'the processor has a process function');
    });

    module('Process');

    QUnit.test('Get the variable', function(assert){
        variableProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        variableProcessor.state = {
            RESPONSE : {
                cardinality         : 'single',
                baseType            : 'identifier',
                value               : 'choice-2'
            }
        };

        var expectedResult =  {
            cardinality : 'single',
            baseType : 'identifier',
            value : 'choice-2'
        };
        assert.deepEqual(variableProcessor.process(), expectedResult, 'returns the variable response');
    });

    QUnit.test('Get the variable value even null', function(assert){
        variableProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        variableProcessor.state = {
            RESPONSE : null
        };

        assert.equal(variableProcessor.process(), null, 'returns null');
    });

    QUnit.test('Fails if no variable is found', function(assert){
        variableProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        variableProcessor.state = {
            RESPONSE_1 : {
                cardinality         : 'single',
                baseType            : 'identifier',
                value               : 'choice-2'
            }
        };
        assert.throws(function(){
            variableProcessor.process();
        }, Error, 'Without the variable in the state it throws and error');
    });
});
