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
 * Expose all expressions processors
 *
 * (Some processor names are equivalent to reserved keywords like null or default,
 * so it's not a typo, I add a letter at the end)
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import baseValue from 'taoQtiItem/scoring/processor/expressions/baseValue';
import correct from 'taoQtiItem/scoring/processor/expressions/correct';
import defaultt from 'taoQtiItem/scoring/processor/expressions/default';
import mapResponse from 'taoQtiItem/scoring/processor/expressions/mapResponse';
import mapResponsePoint from 'taoQtiItem/scoring/processor/expressions/mapResponsePoint';
import mathConstant from 'taoQtiItem/scoring/processor/expressions/mathConstant';
import nulll from 'taoQtiItem/scoring/processor/expressions/null';
import randomFloat from 'taoQtiItem/scoring/processor/expressions/randomFloat';
import randomInteger from 'taoQtiItem/scoring/processor/expressions/randomInteger';
import variable from 'taoQtiItem/scoring/processor/expressions/variable';

/**
 * An ExpressionProcessor
 * @typedef ExpressionProcessor
 * @property {Object} expression - the expression definition
 * @property {Object} preProcessor - helps you to parse and manipulate values
 * @property {Object} state - the session state (responses and variables)
 * @property {Funtion} process - the processing
 */

/**
 * Lists all available expression processors
 * Suffix 'Processor' added to keys here otherwise ES6 thinks property 'default' is an export inside the export
 * @exports taoQtiItem/scoring/processor/expressions/expressions
 */
export default {
    baseValueProcessor: baseValue,
    correctProcessor: correct,
    defaultProcessor: defaultt,
    mapResponseProcessor: mapResponse,
    mapResponsePointProcessor: mapResponsePoint,
    mathConstantProcessor: mathConstant,
    nullProcessor: nulll,
    randomFloatProcessor: randomFloat,
    randomIntegerProcessor: randomInteger,
    variableProcessor: variable
};
