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
 * Expose all expressions processors
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiItem/scoring/processor/expressions/baseValue',
    'taoQtiItem/scoring/processor/expressions/correct',
    'taoQtiItem/scoring/processor/expressions/mathConstant',
    'taoQtiItem/scoring/processor/expressions/null'
], function(baseValue, correct, mathConstant, nulll){
    'use strict';

    /**
     * An ExpressionProcessor
     * @typedef ExpressionProcessor
     * @property {Object} exression - the expression definition
     * @property {Object} state - the session state (responses and variables)
     * @property {Funtion} process - the processing
     */

    /**
     * Lists all available expression processors
     * @exports taoQtiItem/scoring/processor/expressions/expressions
     */
    return {
        'baseValue'     : baseValue,
        'correct'       : correct,
        'mathConstant'  : mathConstant,
        'null'          : nulll
    };

});
