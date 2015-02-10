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
    'lodash'
], function(_){
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
        parseNumbers: function parseNumbers(operands) {
            return _(operands)

                //cast value type, like if they were all arrays, and infer the result type
                .map(function (operand) {

                    var multiple = operand.cardinality !== 'single' && _.isArray(operand.value);
                    var isFloat = operand.baseType === 'float';
                    var value = multiple ? operand.value : [operand.value];

                    return _.map(value, isFloat ? parseFloat : toInt);
                })

                //here we get arrays of arrays so we flatten them
                .flatten();

        },

        /**
         * Take the operands, cast the values to integer or float, flatten them is collection are given and filter on unwanted values.
         * @param {Array<ProcessingValue>|Array<Array<ProcessingValue>>} operands - to map
         * @returns {Object} the LODASH wrapper in order to chain on it.
         */
        mapNumbers : function mapNumbers(operands){
            return this.parseNumbers(operands)
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

    /**
     * Wrap parseInt. It can't be used unwrapped as a map callback
     * due to the radix parameter (that receives the index).
     * @private
     */
    function toInt(value){
        return parseInt(value, 10);
    }

    return preProcessor;
});
