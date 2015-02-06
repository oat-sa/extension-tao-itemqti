define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/multiply'
], function(_, multiplyProcessor){

    module('API');

    QUnit.asyncTest('structure', function(assert){
        QUnit.expect(3);

        assert.ok(_.isPlainObject(multiplyProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(multiplyProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(multiplyProcessor.operands), 'the processor has a process function');

        QUnit.start();
    });


    module('Process');

    QUnit.asyncTest('multiply integers', function(assert){
        QUnit.expect(3);

        multiplyProcessor.operands = [2, 2];
        assert.equal(multiplyProcessor.process(), 4, 'multiply is correct');

        multiplyProcessor.operands = [5, -5];
        assert.equal(multiplyProcessor.process(), -25, 'multiply is correct');

        multiplyProcessor.operands = [0, 12];
        assert.equal(multiplyProcessor.process(), 0, 'multiply is correct');

        QUnit.start();
    });
});

