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
 * The anyN operator processor.
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10641
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
     * Process operands and returns the anyN.
     * @type {OperatorProcessor}
     * @exports taoQtiItem/scoring/processor/expressions/operators/anyN
     */
    var anyNProcessor = {

        min: 1,
        max: -1,

        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single'],
            baseType : ['boolean']
        },

        operands   : [],

        /**
         * Process the anyN of the operands.
         * @returns {?ProcessingValue} is anyN or null
         */
        process : function(){

            var result = {
                cardinality : 'single',
                baseType : 'boolean'
            };


            var counted = preProcessor.parseOperands(this.operands).countBy().value();

            if (counted.true >= this.min && counted.true <= this.max ){
                result.value = true;
            }else

            if (counted.true + counted.null >= this.min && counted.true + counted.null <= this.max) {
                // It could have match if nulls were true values.
                return null;
            }else{

            //if (counted.false >= this.min || counted.true >= this.max ){
                result.value = false;
            }

            return result;
        }
    };

    return anyNProcessor;
});
