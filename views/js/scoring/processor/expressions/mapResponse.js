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
 * The mapResponse expression processor.
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10577
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/scoring/processor/errorHandler'
], function(_, errorHandler){
    'use strict';

    /**
     * Correct expression
     * @type {ExpressionProcesssor}
     * @exports taoQtiItem/scoring/processor/expressions/mapResponse
     */
    var mapResponseProcessor = {

        /**
         * Process the expression
         * @returns {ProcessingValue} the value from the expression
         */
        process : function(){

            var mapResult;
            var identifier = this.expression.attributes.identifier;
            var variable   = this.state[identifier];
            var result     = {
                cardinality : 'single',
                baseType    : 'float',
                value       : variable.defaultValue
            };

            if(typeof variable === 'undefined'){
                 return errorHandler.throw('scoring', new Error('No variable found with identifier ' + identifier ));
            }

            if(variable === null || typeof variable.mapping === 'undefined'){
                 return errorHandler.throw('scoring', new Error('The variable ' + identifier + ' has no mapping, how can I execute a mapResponse on it?'));
            }

            //TODO cast values
            //TODO support entry option case sensitivity

            if(variable.cardinality === 'single'){

                mapResult = _.find(variable.mapping, function(mapValue, mapEntry){
                    return _.isEqual(mapEntry, variable.value);
                });
                if(mapResult !== undefined){
                    result.value = parseFloat(mapResult);
                }

            } else if (variable.cardinality === 'multiple' || variable.cardinality === 'ordered'){

                mapResult = _(variable.mapping)
                    .filter(function(mapValue, mapEntry){
                        return _.contains(variable.value, mapEntry);
                    })
                    .reduce(function(sum, mapValue){
                        return sum + parseFloat(mapValue);
                    });

                if(mapResult !== undefined){
                    result.value = mapResult;
                }
            }

            return result;
        }
    };

    return mapResponseProcessor;
});
