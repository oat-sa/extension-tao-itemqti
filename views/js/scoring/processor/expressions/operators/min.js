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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/expressions/preprocessor'
], function(_, preProcessor){
    'use strict';

    var minProcessor = {

        constraints : {
            minOperand : 1,
            maxOperand : -1,
            cardinality : ['single', 'multiple', 'ordered'],
            baseType : ['integer', 'float']
        },

        operands   : [],

        process : function(){

            var result = {
                cardinality : 'single',
                baseType : 'integer'
            };

            //if at least one operand is null or infinity, then break and return null
            if(_.some(this.operands, _.isNull) === true){
                return null;
            }

            //if at least one operand is a float , the result is a float
            if(_.some(this.operands, { baseType : 'float' })){
                result.baseType = 'float';
            }
            // if any of operand is not numeric, result is null
            if (preProcessor.mapNumbers(this.operands).value().length !== preProcessor.castTypes(this.operands).value().length){
                return null;
            }

            result.value = _.min(preProcessor.mapNumbers(this.operands).value());

            return result;
        }
    };

    return minProcessor;
});
