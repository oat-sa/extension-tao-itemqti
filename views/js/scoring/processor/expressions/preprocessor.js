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
 * Helps you to map the values in the processing in order to use consistent data for the processing.
 * The MAP part of a MAP/REDUCE
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/typeCaster'
], function(_, typeCaster){
    'use strict';

    /**
     * The preprocessor
     * @exports taoQtiItem/scoring/processor/expressions/preprocessor
     */
    var preProcessor = {

        /**
         * Take the operands, cast the values to integer or float, flatten them is collection are given and
         * @param {Array<ProcessingValue>|Array<Array<ProcessingValue>>} operands - to map
         * @returns {Object} the LODASH wrapper in order to chain on it.
         */
        parseOperands: function parseOperands(operands) {
            return _(operands)

                //cast value type, like if they were all arrays, and infer the result type
                .map(function (operand) {

                    var multiple = operand.cardinality === 'multiple' && _.isArray(operand.value);
                    var value = multiple ? operand.value : [operand.value];

                    return _.map(value, typeCaster(operand.baseType));
                })

                //here we get arrays of arrays so we flatten them
                .flatten(true);
        },

        /**
         * Parse and cast the value of a variable
         * @param {ProcessingValue} variable - to parse
         * @returns {ProcessingValue} the parsedVariable
         */
        parseVariable : function parseVariable(variable){
            var caster = typeCaster(variable.baseType);

            if(variable.cardinality === 'single'){
                variable.value = caster(variable.value);
            } else {
                variable.value = _.map(variable.value, caster);
            }
            return variable;
        },

        /**
         * Take the operands, cast the values to integer or float, flatten them is collection are given and filter on unwanted values.
         * @param {Array<ProcessingValue>|Array<Array<ProcessingValue>>} operands - to map
         * @returns {Object} the LODASH wrapper in order to chain on it.
         */
        mapNumbers : function mapNumbers(operands){
            return this.parseOperands(operands)
                //we filter unwanted values
                .filter(this.isNumber);
        },

        /**
         * Check if value is really numeric
         * @param value
         * @returns {Boolean|boolean}
         */
        isNumber : function isNumber(value){
            return _.isNumber(value) && !_.isNaN(value) && _.isFinite(value);
        }
    };

    return preProcessor;
});
