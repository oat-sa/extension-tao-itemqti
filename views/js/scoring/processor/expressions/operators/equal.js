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

        tolerance: [],
        activeToleranceEngine: null,
        includeLowerBound: true,
        includeUpperBound: true,

        engines: {
            exact: function (x, y) {
                return x === y;
            },
            absolute: function (x, y) {
                var lower = equalProcessor.includeLowerBound ? y >= x - equalProcessor.tolerance[0] : y > x - equalProcessor.tolerance[0],
                    upper = equalProcessor.includeUpperBound ? y <= x + equalProcessor.tolerance[1] : y < x + equalProcessor.tolerance[1];
                return lower && upper;
            },
            relative: function (x, y) {
                var lower = equalProcessor.includeLowerBound ? y >= x - (1 - equalProcessor.tolerance[0] / 100) : y > x - (1 - equalProcessor.tolerance[0] / 100),
                    upper = equalProcessor.includeUpperBound ? y <= x + (1 - equalProcessor.tolerance[1] / 100) : y < x + (1 - equalProcessor.tolerance[1] / 100);

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

            if ([this.engines.absolute, this.engines.relative].indexOf(this.activeToleranceEngine) !== -1 && this.tolerance.length === 0) {
                errorHandler.throw('scoring', new Error('tolerance must me specified'));
                return null;
            }

            //if at least one operand is null, then break and return null
            if(_.some(this.operands, _.isNull) === true){
                return null;
            }
            // if only one tolerance bound is given it is used for both.
            if ( equalProcessor.tolerance.length === 1){
                equalProcessor.tolerance.push(equalProcessor.tolerance[0]);
            }

            result.value = this.activeToleranceEngine(preProcessor.parseVariable(this.operands[0]).value,
                preProcessor.parseVariable(this.operands[1]).value);


            return result;
        }
    };

    return equalProcessor;
});
