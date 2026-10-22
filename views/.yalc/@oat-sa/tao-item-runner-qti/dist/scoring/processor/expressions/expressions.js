define(['taoQtiItem/scoring/processor/expressions/baseValue', 'taoQtiItem/scoring/processor/expressions/correct', 'taoQtiItem/scoring/processor/expressions/default', 'taoQtiItem/scoring/processor/expressions/mapResponse', 'taoQtiItem/scoring/processor/expressions/mapResponsePoint', 'taoQtiItem/scoring/processor/expressions/mathConstant', 'taoQtiItem/scoring/processor/expressions/null', 'taoQtiItem/scoring/processor/expressions/randomFloat', 'taoQtiItem/scoring/processor/expressions/randomInteger', 'taoQtiItem/scoring/processor/expressions/variable'], function (baseValue, correct, defaultt, mapResponse, mapResponsePoint, mathConstant, nulll, randomFloat, randomInteger, variable) { 'use strict';

    baseValue = baseValue && Object.prototype.hasOwnProperty.call(baseValue, 'default') ? baseValue['default'] : baseValue;
    correct = correct && Object.prototype.hasOwnProperty.call(correct, 'default') ? correct['default'] : correct;
    defaultt = defaultt && Object.prototype.hasOwnProperty.call(defaultt, 'default') ? defaultt['default'] : defaultt;
    mapResponse = mapResponse && Object.prototype.hasOwnProperty.call(mapResponse, 'default') ? mapResponse['default'] : mapResponse;
    mapResponsePoint = mapResponsePoint && Object.prototype.hasOwnProperty.call(mapResponsePoint, 'default') ? mapResponsePoint['default'] : mapResponsePoint;
    mathConstant = mathConstant && Object.prototype.hasOwnProperty.call(mathConstant, 'default') ? mathConstant['default'] : mathConstant;
    nulll = nulll && Object.prototype.hasOwnProperty.call(nulll, 'default') ? nulll['default'] : nulll;
    randomFloat = randomFloat && Object.prototype.hasOwnProperty.call(randomFloat, 'default') ? randomFloat['default'] : randomFloat;
    randomInteger = randomInteger && Object.prototype.hasOwnProperty.call(randomInteger, 'default') ? randomInteger['default'] : randomInteger;
    variable = variable && Object.prototype.hasOwnProperty.call(variable, 'default') ? variable['default'] : variable;

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
    var expressions = {
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

    return expressions;

});
