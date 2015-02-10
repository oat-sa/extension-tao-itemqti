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
 * Expose all operators processors
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiItem/scoring/processor/expressions/operators/gte',
    'taoQtiItem/scoring/processor/expressions/operators/product',
    'taoQtiItem/scoring/processor/expressions/operators/subtract',
    'taoQtiItem/scoring/processor/expressions/operators/sum'
], function( gte, product, subtract, sum ){
    'use strict';

    /**
     * An OperatorProcessor process operands to gives you a result.
     * @typedef OperatorProcessor
     * @property {Object} expression - the expression definition
     * @property {Array<ProcessingValue} operands - the operands
     * @property {Object} constraints - the validation constraints of the processor
     * @property {Number} constraints.minOperand - the minimum number of operands
     * @property {Number} constraints.maxOperand - the maximum number of operands
     * @property {Array<String>} constraints.cardinality - the supported  cardinalities in 'single', 'multiple', 'ordered' and 'record'
     * @property {Array<String>} constraints.baseType - the supported  types in 'identifier', 'boolean', 'integer', 'float', 'string', 'point', 'pair', 'directedPair', 'duration', 'file', 'uri' and 'intOrIdentifier'
     * @property {Function} process - the processing
     *
     */

    /**
     * Lists all available operator processors
     * @exports taoQtiItem/scoring/processor/expressions/operators/operators
     */
    return {
        "gte"       : gte,
        "product"   : product,
        "subtract"  : subtract,
        "sum"       : sum
    };
});
