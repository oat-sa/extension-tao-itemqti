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
 * Copyright (c) 2015-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * Helps you to map the values in the processing in order to use consistent data for the processing.
 * The MAP part of a MAP/REDUCE
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import _ from 'lodash';
import typeCaster from 'taoQtiItem/scoring/processor/expressions/typeCaster';

/**
 * The preprocessor factory creates a preprocessor object that has access to the state
 * @param {Object} state - the item session state
 * @returns {Object} the preprocessor
 *
 * @exports taoQtiItem/scoring/processor/expressions/preprocessor
 */
var preProcessorFactory = function preProcessorFactory(state) {

    var preProcessor = {

        /**
         * Take the operands, cast the values to integer or float, flatten them is collection are given and
         * @param {Array<ProcessingValue>|Array<Array<ProcessingValue>>} operands - to map
         * @returns {Object} the LODASH wrapper in order to chain on it.
         */
        parseOperands: function parseOperands(operands) {
            return _(operands)
                //cast value type, like if they were all arrays, and infer the result type
                .map(function(operand) {
                    var caster;
                    var multiple;
                    var value;

                    if (_.isNull(operand)) {
                        return operand;
                    }
                    //in case we found record container
                    if (operand.cardinality === 'record' && _.isObject(operand.value)) {
                        return _.mapValues(operand.value, preProcessor.parseVariable);
                    }

                    caster = _.partialRight(typeCaster(operand.baseType), state);
                    multiple = operand.cardinality === 'multiple' || operand.cardinality === 'ordered' && _.isArray(operand.value);
                    value = multiple ? operand.value : [operand.value];

                    if (operand.cardinality === 'multiple') {
                        value = value.sort(); //sort for
                    }

                    return _.map(value, caster);
                })

            //here we get arrays of arrays so we flatten them
            .flatten(true);
        },

        /**
         * Parse and cast the value of a variable
         * @param {ProcessingValue} variable - to parse
         * @returns {ProcessingValue} the parsedVariable
         */
        parseVariable: function parseVariable(variable) {
            variable.value = preProcessor.parseValue(variable.value, variable.baseType, variable.cardinality);
            return variable;
        },

        /**
         * Parse a value regarding a type and a cardinality
         * @param {*} value - the value to parse
         * @param {String} baseType - in the QTI baseTypes
         * @param {String} [cardinality='single'] - either single, multiple, ordered or record
         * @returns {*} the parsed value
         */
        parseValue: function(value, baseType, cardinality) {
            var caster = typeCaster(baseType);

            if (value !== null) {
                if (cardinality === 'record') {
                    return _.mapValues(value, preProcessor.parseVariable);
                }
                cardinality = cardinality || 'single';

                if (cardinality === 'single') {
                    value = caster(value, state);
                } else {
                    value = _.map(value, caster);
                }

                if (cardinality === 'multiple') {
                    value = value.sort(); //sort for comparison
                }
            }
            return value;
        },

        /**
         * Take the operands, cast the values to integer or float, flatten them is collection are given and filter on unwanted values.
         * @param {Array<ProcessingValue>|Array<Array<ProcessingValue>>} operands - to map
         * @returns {Object} the LODASH wrapper in order to chain on it.
         */
        mapNumbers: function mapNumbers(operands) {
            return this.parseOperands(operands)
                //we filter unwanted values
                .filter(this.isNumber);
        },

        /**
         * Check if value is really numeric
         * @param {Number} value
         * @returns {Boolean|boolean}
         */
        isNumber: function isNumber(value) {
            return _.isNumber(value) && !_.isNaN(value) && _.isFinite(value);
        }
    };
    return preProcessor;
};

export default preProcessorFactory;
