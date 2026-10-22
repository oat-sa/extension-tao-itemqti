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
 * The inside operator processor.
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10671
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import _ from 'lodash';
import isPointInShape from 'taoQtiItem/scoring/processor/expressions/isPointInShape';

/**
 * Process operands and returns the inside.
 * @type {OperatorProcessor}
 * @exports taoQtiItem/scoring/processor/expressions/operators/inside
 */
var insideProcessor = {

    constraints: {
        minOperand: 1,
        maxOperand: 1,
        cardinality: ['single', 'ordered', 'multiple'],
        baseType: ['point']
    },

    operands: [],

    /**
     * Process the inside of the operands.
     * @returns {?ProcessingValue} is inside or null
     */
    process: function() {

        var result = {
            cardinality: 'single',
            baseType: 'boolean'
        };
        var point;

        var attributes = this.expression.attributes;
        var shape = attributes.shape || 'default';
        var coords = _.map(attributes.coords.split(','), parseFloat);

        //if at least one operand is null, then break and return null
        if (_.some(this.operands, _.isNull) === true) {
            return null;
        }

        point = this.preProcessor.parseVariable(this.operands[0]).value;

        result.value = isPointInShape(shape, point, coords);

        return result;
    }
};

export default insideProcessor;
