define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/correct'
], function(_, correctProcessor){

    module('API');

    QUnit.test('structure', function(assert){
        assert.ok(_.isPlainObject(correctProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(correctProcessor.process), 'the processor has a process function');
    });

    module('Process');

    QUnit.test('Get the correct value', function(assert){
        correctProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        correctProcessor.state = {
            RESPONSE : {
                cardinality         : 'single',
                baseType            : 'identifier',
                correctResponse     : 'choice-1',
                mapping             : [],
                areaMapping         : [],
                value               : 'choice-2'
            }
        };

        var expectedResult =  {
            cardinality : 'single',
            baseType : 'identifier',
            value : 'choice-1'
        };
        assert.deepEqual(correctProcessor.process(), expectedResult, 'returns the correct response');
    });

    QUnit.test('Get the correct value even null', function(assert){
        correctProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        correctProcessor.state = {
            RESPONSE : null
        };

        assert.equal(correctProcessor.process(), null, 'returns null');
    });

    QUnit.test('Fails if no variable is found', function(assert){
        correctProcessor.expression = {
            attributes : { identifier : 'RESPONSE' }
        };
        correctProcessor.state = {
            RESPONSE_1 : {
                cardinality         : 'single',
                baseType            : 'identifier',
                correctResponse     : 'choice-1',
                mapping             : [],
                areaMapping         : [],
                value               : 'choice-2'
            }
        };
        assert.throws(function(){
            correctProcessor.process();
        }, Error, 'Without the variable in the state it throws and error');
    });

});
