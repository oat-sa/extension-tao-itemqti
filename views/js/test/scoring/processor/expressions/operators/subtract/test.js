define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/subtract'
], function(_, subtractProcessor){

    module('API');

    QUnit.asyncTest('structure', function(assert){
        QUnit.expect(3);

        assert.ok(_.isPlainObject(subtractProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(subtractProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(subtractProcessor.operands), 'the processor has a process function');

        QUnit.start();
    });


    module('Process');

    QUnit.asyncTest('subtract integers', function(assert){
        QUnit.expect(2);

        subtractProcessor.operands = [10, 5];
        assert.equal(subtractProcessor.process(), 5, 'subtract is correct');

        subtractProcessor.operands = [50, 150];
        assert.equal(subtractProcessor.process(), -100, 'subtract is correct');

        QUnit.start();
    });

    QUnit.asyncTest('subtract floats', function(assert){
        QUnit.expect(1);

        subtractProcessor.operands = [-0.75, -0.25];
        assert.equal(subtractProcessor.process(), -0.5, 'subtract is correct');

        QUnit.start();
    });

    QUnit.asyncTest('subtract breaks with at least one null operand', function(assert){
        QUnit.expect(2);

        subtractProcessor.operands = [null, null];
        assert.equal(subtractProcessor.process(), null, 'the processor returns null');

        subtractProcessor.operands = [1, null];
        assert.equal(subtractProcessor.process(), null, 'the processor returns null');

        QUnit.start();
    });
});

