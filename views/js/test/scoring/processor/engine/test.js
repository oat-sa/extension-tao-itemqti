define([
    'taoQtiItem/scoring/processor/engine'
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
            qticlass : 'sum',
            expressions : [{
                qticlass : 'baseValue',
                value    : 3
            },{
                qticlass : 'baseValue',
                value    : 7
            }]
        };

        var parser = expressionParserFactory();

        assert.equal(parser.parse(expression), 10, 'the parser compute the right result');

        QUnit.start();
    });

    QUnit.asyncTest('5 operands sum expression', function(assert){
        QUnit.expect(1);

        var expression = {
            qticlass : 'sum',
            expressions : [{
                qticlass : 'baseValue',
                value    : 1
            },{
                qticlass : 'baseValue',
                value    : 1
            },{
                qticlass : 'baseValue',
                value    : 2
            },{
                qticlass : 'baseValue',
                value    : 3
            },{
                qticlass : 'baseValue',
                value    : 5
            }]
        };

        var parser = expressionParserFactory();

        assert.equal(parser.parse(expression), 12, 'the parser compute the right result');

        QUnit.start();
    });

    module('Parse 2 levels tree');

    QUnit.asyncTest('2 operands sum expression', function(assert){
        QUnit.expect(1);

        var expression = {
            qticlass : 'subtract',
            expressions : [{
                qticlass : 'sum',
                expressions : [{
                    qticlass : 'baseValue',
                    value    : 3
                },{
                    qticlass : 'baseValue',
                    value    : 7
                },{
                    qticlass : 'baseValue',
                    value    : 5
                }]
            },{
                qticlass : 'sum',
                expressions : [{
                    qticlass : 'baseValue',
                    value    : 4
                },{
                    qticlass : 'baseValue',
                    value    : 8
                }]
            }]
        };

        var parser = expressionParserFactory();

        assert.equal(parser.parse(expression), 3, 'the parser compute the right result');

        QUnit.start();
    });
});

