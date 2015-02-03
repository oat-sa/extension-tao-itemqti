define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/processor.js',
    'taoQtiItem/scoring/processor/expressions/expressions.js',
    'taoQtiItem/scoring/processor/expressions/operators/operators.js'
], function(_, processorFactory, expressionProcessors, operatorProcessors){

    var operators = _.keys(operatorProcessors);

    //regsiter all processors
    _.forEach(expressionProcessors, function(expressionProcessor, name){
        processorFactory.register(name, processorFactory.type.EXPRESSION, expressionProcessor);
    });
    _.forEach(operatorProcessors, function(operatorProcessor, name){
        processorFactory.register(name, processorFactory.type.OPERATOR, operatorProcessor);
    });

    var expressionParserFactory = function(){

        var trail = [];
        var marker = [];
        var operands = [];

        var isMarked = function isMarked(expression){
            return _.contains(marker, expression.qticlass);
        };

        var mark = function mark(expression){
            marker.push(expression.qtiClass);
        };

        var isOperator = function isOperator(expression){
            return _.contains(operators, expression.qticlass);
        };

        return {
            parse : function(response, expression){

                var currentExpression,
                    currentOperands,
                    currentProcessor,
                    result;

                var baseExpression = expression.qticlass;

                trail.push(expression);

                while(trail.length > 0){

                    currentExpression = trail.pop();
                    currentOperands = [];
                    currentProcessor = null;

                    if(!isMarked(currentExpression) && isOperator(currentExpression)){

                        mark(currentExpression);

                        trail.push(currentExpression);

                        //reverse push sub expressions
                        _.forEachRight(currentExpression.expressions, function(subExpression){
                            trail.push(subExpression);
                        });

                    } else if (isMarked(currentExpression)){
                        // Operator, second pass. Process it.
                        _.times(currentExpression.expressions, function(){
                            currentOperands.push(operands.pop());
                        });

                        currentProcessor = processorFactory(currentExpression.qticlass);
                        currentProcessor.operands = currentOperands;
                        result = currentProcessor.process(response);

                        if (currentExpression.qticlass !== baseExpression) {
                            operands.push(result);
                        }
                    } else {
                        // Simple expression, process it.
                        currentProcessor = processorFactory(currentExpression.qticlass);
                        result = currentProcessor.process(response);

                        operands.push(result);
                    }
                }
                return result;
            }
        };
    };

    return expressionParserFactory;
});
