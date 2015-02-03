define([
    'lodash'
], function(_){

    var processors = {};



    var expressionProcessor = function expressionProcessor(name){

        var processor = processors.expression[name] || processors.operator[name];
        if(!processor){
            throw new Error('No processor found for ' + name);
        }

        return {
            process : function(){
                processor.process.call(this);
            }
        };
    };

    expressionProcessor.types = {
        EXPRESSION  : "expression",
        OPERATOR    : "operator"
    };

    expressionProcessor.register = function register(name, type, processor){

        if(!_.contains(this.types, type)){
            throw new TypeError( type + ' is not a valid expression type');
        }
        //TODO white list checking
        if(_.isEmpty(name)){
            throw new TypeError('Please give a valid name to your processor');
        }
        if(!_.isPlainObject(processor) || !_.isFunction(processor.process)){
            throw new TypeError('The processor must be an object that contains a process method.');
        }

        processors[type] = processors[type] || {};
        processors[type][name] = processor;
    };

    return expressionProcessor;
});
