define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/sum'
], function(_, sumProcessor){

    module('API');

    QUnit.asyncTest('structure', function(assert){
        QUnit.expect(3);

        assert.ok(_.isPlainObject(sumProcessor), 'the processor expose an object');
        assert.ok(_.isFunction(sumProcessor.process), 'the processor has a process function');
        assert.ok(_.isArray(sumProcessor.operands), 'the processor has a process function');

        QUnit.start();
    });


    module('Process');

    QUnit.asyncTest('sum integers', function(assert){
        QUnit.expect(3);

        sumProcessor.operands = [1, 1, 2, 3, 5];
        assert.equal(sumProcessor.process(), 12, 'sum is correct');

        sumProcessor.operands = [1, 1, 2, 3, -5];
        assert.equal(sumProcessor.process(), 2, 'sum is correct');

        sumProcessor.operands = [0, -10, -5];
        assert.equal(sumProcessor.process(), -15, 'sum is correct');

        QUnit.start();
    });

    QUnit.asyncTest('sum floats', function(assert){
        QUnit.expect(1);

        sumProcessor.operands = [0.33, 0.25, 0.25, 0.33333, 4.01];
        assert.equal(sumProcessor.process(), 5.17333, 'sum is correct');

        QUnit.start();
    });

    QUnit.asyncTest('sum invalid numbers', function(assert){
        QUnit.expect(1);

        sumProcessor.operands = ["1", "2", 3, NaN];
        assert.equal(sumProcessor.process(), 3, 'sum is correct');

        QUnit.start();
    });

    QUnit.asyncTest('sum breaks with at least one null operand', function(assert){
        QUnit.expect(3);

        sumProcessor.operands = [1, null, null, 2];
        assert.equal(sumProcessor.process(), null, 'the processor returns null');

        sumProcessor.operands = [1, 2, 3, 5, null];
        assert.equal(sumProcessor.process(), null, 'the processor returns null');

        sumProcessor.operands = [1, 2, 3, 5, undefined];
        assert.equal(sumProcessor.process(), 11, 'the processor accepts (ignore) undefined ');

        QUnit.start();
    });
});

