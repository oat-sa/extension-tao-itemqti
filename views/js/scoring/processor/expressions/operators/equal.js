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
 * The equal operator processor.
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10654
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/preprocessor',
    'taoQtiItem/scoring/processor/errorHandler'
], function(_, preProcessor, errorHandler){
    'use strict';

    /**
     * Process operands and returns the equal.
     * @type {OperatorProcessor}
     * @exports taoQtiItem/scoring/processor/expressions/operators/equal
     */
    var equalProcessor = {

        engines: {
            exact: function (x, y) {
                return x === y;
            },
            absolute: function (x, y, includeLowerBound, includeUpperBound, tolerance) {
                var lower = includeLowerBound ? y >= x - tolerance[0] : y > x - tolerance[0],
                    upper = includeUpperBound ? y <= x + tolerance[1] : y < x + tolerance[1];
                return lower && upper;
            },
            relative: function (x, y, includeLowerBound, includeUpperBound, tolerance) {
                var lower = includeLowerBound ? y >= x - (1 - tolerance[0] / 100) : y > x - (1 - tolerance[0] / 100),
                    upper = includeUpperBound ? y <= x + (1 - tolerance[1] / 100) : y < x + (1 - tolerance[1] / 100);

                return lower && upper;
            }
        },

        constraints : {
            minOperand : 2,
            maxOperand : 2,
            cardinality : ['single'],
            baseType : ['integer', 'float']
        },

        operands   : [],

        /**
         * Process the equal of the operands.
         * @returns {?ProcessingValue} is equal or null
         */
        process : function(){

            var result = {
                cardinality : 'single',
                baseType : 'boolean'
            };

            var toleranceMode = _.isFunction(this.expression.attributes.toleranceMode) ? this.expression.attributes.toleranceMode : equalProcessor.engines.exact,
                tolerance = _.isArray(this.expression.attributes.tolerance) ? this.expression.attributes.tolerance : [],
                includeLowerBound = _.isBoolean(this.expression.attributes.includeLowerBound) ? this.expression.attributes.includeLowerBound : true,
                includeUpperBound = _.isBoolean(this.expression.attributes.includeUpperBound) ? this.expression.attributes.includeUpperBound : true;


            if ([this.engines.absolute, this.engines.relative].indexOf(toleranceMode) !== -1 && tolerance.length === 0) {
                errorHandler.throw('scoring', new Error('tolerance must me specified'));
                return null;
            }

            //if at least one operand is null, then break and return null
            if(_.some(this.operands, _.isNull) === true){
                return null;
            }

            // if only one tolerance bound is given it is used for both.
            if ( tolerance.length === 1){
                tolerance.push(tolerance[0]);
            }

            result.value = toleranceMode(preProcessor.parseVariable(this.operands[0]).value,
                preProcessor.parseVariable(this.operands[1]).value, includeLowerBound, includeUpperBound, tolerance);

            return result;
        }
    };

    return equalProcessor;
});
