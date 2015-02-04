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
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_){
    'use strict';

    var processors = {};

    var expressionProcessor = function expressionProcessor(expression, context){

        var name      = expression.qticlass;
        var processor = processors.expression[name] || processors.operator[name];
        if(!processor){
            throw new Error('No processor found for ' + name);
        }
        processor = _.defaults(context || {}, processor);
        processor.expression = expression;

        return {
            process : function process(){
                return processor.process.apply(processor, [].slice.call(arguments, 1));
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
