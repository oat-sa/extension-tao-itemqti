define([
    'taoQtiItem/scoring/processor/expressions/engine'
], function(expressionParserFactory){

    module('API');

    QUnit.asyncTest('factory', function(assert){
        QUnit.expect(1);

        assert.ok(typeof expressionParserFactory === 'function', 'the engine expose a factory');

        QUnit.start();
    });

    QUnit.asyncTest('parser', function(assert){
        QUnit.expect(2);

        var parser = expressionParserFactory();

        assert.ok(typeof parser === 'object', 'the parser is an object');
        assert.ok(typeof parser.parse === 'function', 'the parser exposes a parse function');

        QUnit.start();
    });


    module('Parse 1 level tree');

    QUnit.asyncTest('2 operands sum expression', function(assert){
        QUnit.expect(1);

        var expression = {
            qtiClass : 'sum',
            expressions : [{
                qtiClass : "baseValue",
                attributes : {
                    baseType : "integer"
                },
                value : "3"
            },{
                qtiClass : "baseValue",
                attributes : {
                    baseType : "integer"
                },
                value : "7"
            }]
        };

        var expectedResult = {
            cardinality : 'single',
            baseType : 'integer',
            value : 10
        };

        var parser = expressionParserFactory();

        assert.deepEqual(parser.parse(expression), expectedResult, 'the parser compute the right result');

        QUnit.start();
    });

    module('Parse 2 levels tree');

    QUnit.asyncTest('2 operands sum expression', function(assert){
        QUnit.expect(1);

        var expression = {
            qtiClass : 'subtract',
            expressions : [{
                qtiClass : 'sum',
                expressions : [{
                    qtiClass : "baseValue",
                    attributes : {
                        baseType : "integer"
                    },
                    value : "3"
                },{
                    qtiClass : "baseValue",
                    attributes : {
                        baseType : "integer"
                    },
                    value : "7"
                },{
                    qtiClass : "baseValue",
                    attributes : {
                        baseType : "integer"
                    },
                    value : "5"
                }]
            }, {
                qtiClass : 'product',
                expressions : [{
                    qtiClass : "baseValue",
                    attributes : {
                        baseType : "integer"
                    },
                    value : "2"
                },{
                    qtiClass : "baseValue",
                    attributes : {
                        baseType : "integer"
                    },
                    value : "5"
                }]
            }]
        };

        var expectedResult = {
            cardinality : 'single',
            baseType : 'integer',
            value : 5
        };
        var parser = expressionParserFactory();
        assert.deepEqual(parser.parse(expression), expectedResult, 'the parser compute the right result');

        QUnit.start();
    });
});

