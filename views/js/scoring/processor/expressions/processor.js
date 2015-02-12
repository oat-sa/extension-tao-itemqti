/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * Single entry point for the expressions processors.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/preprocessor',
], function(_, preProcessor){
    'use strict';

    /**
     * All values handled by a processor
     * @typedef ProcessingValue
     * @property {String} baseType - the value type in 'identifier', 'boolean', 'integer', 'float', 'string', 'point', 'pair', 'directedPair', 'duration', 'file', 'uri' and 'intOrIdentifier'
     * @property {String} cardinality - the value  cardinality in 'single', 'multiple', 'ordered' and 'record'
     * @property {*} value - the real value
     */

    //keeps the references of processors (this is something we may load dynamically)
    var processors = {};

    /**
     * Provides you a processor from an expression (definition) and against a state.
     * The Processor must have been registerd previously.
     * It will also validate the processor against the given expression and context.
     * See it as a kind of factory.
     *
     * @param {Object} expression - the expression definition
     * @param {String} expression.qtiClass - the expression name that should mastch with the processor name
     * @param {Object} state - the state to give to the processor to lookup for variables like responses
     * @param {Array} [operands] - the operands for an operator processor
     * @returns {ExpressionProcessorWrapper} a transparent object that delegates the calls to the processor
     * @throws {TypeError} when the validation fails
     * @throws {Error} by trying to use an unregistered processor
     */
    var expressionProcessor = function expressionProcessor(expression, state, operands){

        var name      = expression.qtiClass;
        var processor = processors.expression[name] || processors.operator[name];

        var validate  = function validate(){

            var size = 0;
            var minOperand  = processor.constraints.minOperand;
            var maxOperand  = processor.constraints.maxOperand;

            var hasWrongType = function hasWrongType(operand){
                return !_.contains(processor.constraints.baseType, operand.baseType);
            };

            var hasWrongCardinality = function hasWrongCardinality(operand){
                return !_.contains(processor.constraints.cardinality, operand.cardinality);
            };

            if(!_.isArray(operands)){
                throw new TypeError('Processor ' + name + ' requires operands to be an array : ' +  (typeof operands)  + ' given');
            }
            size = _.size(operands);

            if(minOperand > 0 && size < minOperand){
                throw new TypeError('Processor ' + name + ' requires at least ' + minOperand + ' operands, ' + size + ' given');
            }
            if(maxOperand > -1 && size > maxOperand){
                throw new TypeError('Processor ' + name + ' requires maximum ' + maxOperand + ' operands, ' + size + ' given');
            }
            if(_.some(operands, hasWrongType)){
                throw new TypeError('An operand given to processor ' + name + ' has an unexpected baseType');
            }
            if(_.some(operands, hasWrongCardinality)){
                throw new TypeError('An operand given to processor ' + name + ' has an unexpected cardinality');
            }
            return true;
        };

        if(!processor){
            throw new Error('No processor found for ' + name);
        }

        processor.expression = expression;
        processor.state      = state;

        //validate operators
        if(processor.operands && processor.constraints){
            validate();

            processor.operands = operands;
        }

        /**
         * Wrap ad forward the processing to the enclosed processor
         * @typedef ExpressionProcessorWrapper
         * @property {Function} process - call's processor's process
         */
        return {
            process : function process(){
                //forward the call to the related expression processor
                return processor.process.apply(processor, [].slice.call(arguments, 1));
            }
        };
    };

    /**
     *
     */
    expressionProcessor.types = {
        EXPRESSION  : "expression",
        OPERATOR    : "operator"
    };

    /**
     * Register a processor
     * @param {String} name - the processor name
     * @param {String} type - the processor type see expressionProcessor.types
     * @param {ExpressionProcessor|OperatorProcessor} processor - the processor to register
     * @throws {TypeError} when a parameter isn't valid
     */
    expressionProcessor.register = function register(name, type, processor){

        if(!_.contains(this.types, type)){
            throw new TypeError( type + ' is not a valid expression type');
        }
        if(_.isEmpty(name)){
            throw new TypeError('Please give a valid name to your processor');
        }
        if(!_.isPlainObject(processor) || !_.isFunction(processor.process)){
            throw new TypeError('The processor must be an object that contains a process method.');
        }

        processors[type] = processors[type] || {};
        processors[type][name] = processor;
    };

    /**
     * @exports taoQtiItem/scoring/processor/expressions/processor
     */
    return expressionProcessor;
});
