define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/operators/constraintValidator',
    'taoQtiItem/scoring/processor/errorHandler'
], function(_, constraintValidator, errorHandler){
    "use strict";

    QUnit.module('API');

    QUnit.test('structure', function(assert){
        assert.equal(typeof constraintValidator, 'function', 'the module exports a function');
    });


    QUnit.module('Validate');

    var dataProvider = [{
        title : 'all operands null',
        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single'],
            baseType : ['boolean']
        },
        operands : [null, null, null],
        expectedResult : true
    }, {
        title : 'all valide and one null',
        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single'],
            baseType : ['boolean']
        },
        operands : [{
            baseType : 'boolean',
            cardinality : 'single',
            value : true
        }, {
            baseType : 'boolean',
            cardinality : 'single',
            value : false
        }, null],
        expectedResult : true
    }, {
        title : 'all valide but invalid type',
        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single', 'multiple'],
            baseType : ['integer']
        },
        operands : [{
            baseType : 'integer',
            cardinality : 'single',
            value : 12
        }, {
            baseType : 'integer',
            cardinality : 'multiple',
            value : [4, 7, 13]
        }, {
            baseType : 'boolean',
            cardinality : 'multiple',
            value : false
        }],
        error: new TypeError('An operand given to processor foo has an unexpected baseType')
    }, {
        title : 'all valide but one',
        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single'],
            baseType : ['boolean']
        },
        operands : [{
            baseType : 'boolean',
            cardinality : 'single',
            value : true
        }, {
            baseType : 'boolean',
            cardinality : 'single',
            value : false
        }, {
            baseType : 'boolean',
            cardinality : 'multiple',
            value : false
        }],
        error: new TypeError('An operand given to processor foo has an unexpected cardinality')
    }, {
        title : 'wrong operands type',
        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single'],
            baseType : ['boolean']
        },
        operands : 'a,b',
        error: new TypeError('Processor foo requires operands to be an array : string given')
    }, {
        title : 'wrong operands minimum size',
        constraints : {
            minOperand : 2,
            maxOperand : 3,
            cardinality : ['single'],
            baseType : ['boolean']
        },
        operands : [{
            baseType : 'boolean',
            cardinality : 'single',
            value : true
        }],
        error: new TypeError('Processor foo requires at least 2 operands, 1 given')
    }, {
        title : 'wrong operands maximum size',
        constraints : {
            minOperand : 1,
            maxOperand : 2,
            cardinality : ['single'],
            baseType : ['boolean']
        },
        operands : [{
            baseType : 'boolean',
            cardinality : 'single',
            value : true
        }, {
            baseType : 'boolean',
            cardinality : 'single',
            value : false
        }, {
            baseType : 'boolean',
            cardinality : 'multiple',
            value : false
        }],
        error: new TypeError('Processor foo requires maximum 2 operands, 3 given')
    }];

    QUnit
    .cases(dataProvider)
    .asyncTest('constraintValidator.validate', function (data, assert) {

        var processor = {
            name : 'foo',
            constraints : data.constraints
        };

        if(data.error){
            QUnit.expect(2);
            errorHandler.listen('scoring', function(err){
                assert.ok(err instanceof Error, 'The given error is an error');
                assert.equal(data.error.message, err.message, 'The error message is the same');
                QUnit.start();
            });
            constraintValidator(processor, data.operands);
        } else {
            QUnit.expect(1);
            assert.equal(constraintValidator(processor, data.operands), data.expectedResult, 'The validation returns what is expected');
            QUnit.start();
        }
    });
});
