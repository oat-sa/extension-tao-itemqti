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
 * along with this program; if customOperator, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * The customOperator operator processor.
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10635
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import errorHandler from 'taoQtiItem/scoring/processor/errorHandler';
import constraintValidator from 'taoQtiItem/scoring/processor/expressions/operators/constraintValidator';

/**
 * Process operands and returns the customOperator.
 * @type {OperatorProcessor}
 * @exports taoQtiItem/scoring/processor/expressions/operators/customOperator
 */
var customOperatorProcessor = {

    constraints: {
        minOperand: -1,
        maxOperand: -1,
        cardinality: ['single', 'multiple'],
        baseType: ['identifier', 'boolean', 'integer', 'float', 'string', 'point', 'pair', 'directedPair', 'duration', 'file', 'uri', 'intOrIdentifier']
    },

    operands: [],

    /**
     * Process the customOperator of the operands.
     * @returns {?ProcessingValue} the customOperator or null
     */
    process: function() {

        var classs = this.expression.attributes['class'];
        var definition = this.expression.attributes.definition; //not used
        var custom;

        if (!window.require.defined(classs)) {
            return errorHandler.throw('scoring', new Error('Class must be specified for custom operator'));
        }

        custom = window.require(classs);
        if (constraintValidator(custom, customOperatorProcessor.operands)) {
            custom.preProcessor = customOperatorProcessor.preProcessor;
            custom.operands = customOperatorProcessor.operands;
            custom.expression = [];
            custom.expression.attributes = customOperatorProcessor.expression.attributes;

            return custom.process();
        }
    }
};

export default customOperatorProcessor;
