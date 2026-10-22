define(['taoQtiItem/scoring/processor/expressions/operators/and', 'taoQtiItem/scoring/processor/expressions/operators/anyN', 'taoQtiItem/scoring/processor/expressions/operators/containerSize', 'taoQtiItem/scoring/processor/expressions/operators/contains', 'taoQtiItem/scoring/processor/expressions/operators/customOperator', 'taoQtiItem/scoring/processor/expressions/operators/delete', 'taoQtiItem/scoring/processor/expressions/operators/divide', 'taoQtiItem/scoring/processor/expressions/operators/durationGTE', 'taoQtiItem/scoring/processor/expressions/operators/durationLT', 'taoQtiItem/scoring/processor/expressions/operators/equal', 'taoQtiItem/scoring/processor/expressions/operators/equalRounded', 'taoQtiItem/scoring/processor/expressions/operators/fieldValue', 'taoQtiItem/scoring/processor/expressions/operators/gcd', 'taoQtiItem/scoring/processor/expressions/operators/gt', 'taoQtiItem/scoring/processor/expressions/operators/gte', 'taoQtiItem/scoring/processor/expressions/operators/index', 'taoQtiItem/scoring/processor/expressions/operators/inside', 'taoQtiItem/scoring/processor/expressions/operators/integerDivide', 'taoQtiItem/scoring/processor/expressions/operators/integerModulus', 'taoQtiItem/scoring/processor/expressions/operators/integerToFloat', 'taoQtiItem/scoring/processor/expressions/operators/isNull', 'taoQtiItem/scoring/processor/expressions/operators/lcm', 'taoQtiItem/scoring/processor/expressions/operators/lt', 'taoQtiItem/scoring/processor/expressions/operators/lte', 'taoQtiItem/scoring/processor/expressions/operators/match', 'taoQtiItem/scoring/processor/expressions/operators/mathOperator', 'taoQtiItem/scoring/processor/expressions/operators/max', 'taoQtiItem/scoring/processor/expressions/operators/member', 'taoQtiItem/scoring/processor/expressions/operators/min', 'taoQtiItem/scoring/processor/expressions/operators/multiple', 'taoQtiItem/scoring/processor/expressions/operators/not', 'taoQtiItem/scoring/processor/expressions/operators/or', 'taoQtiItem/scoring/processor/expressions/operators/ordered', 'taoQtiItem/scoring/processor/expressions/operators/patternMatch', 'taoQtiItem/scoring/processor/expressions/operators/power', 'taoQtiItem/scoring/processor/expressions/operators/product', 'taoQtiItem/scoring/processor/expressions/operators/random', 'taoQtiItem/scoring/processor/expressions/operators/repeat', 'taoQtiItem/scoring/processor/expressions/operators/round', 'taoQtiItem/scoring/processor/expressions/operators/roundTo', 'taoQtiItem/scoring/processor/expressions/operators/statsOperator', 'taoQtiItem/scoring/processor/expressions/operators/stringMatch', 'taoQtiItem/scoring/processor/expressions/operators/substring', 'taoQtiItem/scoring/processor/expressions/operators/subtract', 'taoQtiItem/scoring/processor/expressions/operators/sum', 'taoQtiItem/scoring/processor/expressions/operators/truncate'], function (and, anyN, containerSize, contains, customOperator, deletee, divide, durationGTE, durationLT, equal, equalRounded, fieldValue, gcd, gt, gte, index, inside, integerDivide, integerModulus, integerToFloat, isNull, lcm, lt, lte, match, mathOperator, max, member, min, multiple, not, or, ordered, patternMatch, power, product, random, repeat, round, roundTo, statsOperator, stringMatch, substring, subtract, sum, truncate) { 'use strict';

    and = and && Object.prototype.hasOwnProperty.call(and, 'default') ? and['default'] : and;
    anyN = anyN && Object.prototype.hasOwnProperty.call(anyN, 'default') ? anyN['default'] : anyN;
    containerSize = containerSize && Object.prototype.hasOwnProperty.call(containerSize, 'default') ? containerSize['default'] : containerSize;
    contains = contains && Object.prototype.hasOwnProperty.call(contains, 'default') ? contains['default'] : contains;
    customOperator = customOperator && Object.prototype.hasOwnProperty.call(customOperator, 'default') ? customOperator['default'] : customOperator;
    deletee = deletee && Object.prototype.hasOwnProperty.call(deletee, 'default') ? deletee['default'] : deletee;
    divide = divide && Object.prototype.hasOwnProperty.call(divide, 'default') ? divide['default'] : divide;
    durationGTE = durationGTE && Object.prototype.hasOwnProperty.call(durationGTE, 'default') ? durationGTE['default'] : durationGTE;
    durationLT = durationLT && Object.prototype.hasOwnProperty.call(durationLT, 'default') ? durationLT['default'] : durationLT;
    equal = equal && Object.prototype.hasOwnProperty.call(equal, 'default') ? equal['default'] : equal;
    equalRounded = equalRounded && Object.prototype.hasOwnProperty.call(equalRounded, 'default') ? equalRounded['default'] : equalRounded;
    fieldValue = fieldValue && Object.prototype.hasOwnProperty.call(fieldValue, 'default') ? fieldValue['default'] : fieldValue;
    gcd = gcd && Object.prototype.hasOwnProperty.call(gcd, 'default') ? gcd['default'] : gcd;
    gt = gt && Object.prototype.hasOwnProperty.call(gt, 'default') ? gt['default'] : gt;
    gte = gte && Object.prototype.hasOwnProperty.call(gte, 'default') ? gte['default'] : gte;
    index = index && Object.prototype.hasOwnProperty.call(index, 'default') ? index['default'] : index;
    inside = inside && Object.prototype.hasOwnProperty.call(inside, 'default') ? inside['default'] : inside;
    integerDivide = integerDivide && Object.prototype.hasOwnProperty.call(integerDivide, 'default') ? integerDivide['default'] : integerDivide;
    integerModulus = integerModulus && Object.prototype.hasOwnProperty.call(integerModulus, 'default') ? integerModulus['default'] : integerModulus;
    integerToFloat = integerToFloat && Object.prototype.hasOwnProperty.call(integerToFloat, 'default') ? integerToFloat['default'] : integerToFloat;
    isNull = isNull && Object.prototype.hasOwnProperty.call(isNull, 'default') ? isNull['default'] : isNull;
    lcm = lcm && Object.prototype.hasOwnProperty.call(lcm, 'default') ? lcm['default'] : lcm;
    lt = lt && Object.prototype.hasOwnProperty.call(lt, 'default') ? lt['default'] : lt;
    lte = lte && Object.prototype.hasOwnProperty.call(lte, 'default') ? lte['default'] : lte;
    match = match && Object.prototype.hasOwnProperty.call(match, 'default') ? match['default'] : match;
    mathOperator = mathOperator && Object.prototype.hasOwnProperty.call(mathOperator, 'default') ? mathOperator['default'] : mathOperator;
    max = max && Object.prototype.hasOwnProperty.call(max, 'default') ? max['default'] : max;
    member = member && Object.prototype.hasOwnProperty.call(member, 'default') ? member['default'] : member;
    min = min && Object.prototype.hasOwnProperty.call(min, 'default') ? min['default'] : min;
    multiple = multiple && Object.prototype.hasOwnProperty.call(multiple, 'default') ? multiple['default'] : multiple;
    not = not && Object.prototype.hasOwnProperty.call(not, 'default') ? not['default'] : not;
    or = or && Object.prototype.hasOwnProperty.call(or, 'default') ? or['default'] : or;
    ordered = ordered && Object.prototype.hasOwnProperty.call(ordered, 'default') ? ordered['default'] : ordered;
    patternMatch = patternMatch && Object.prototype.hasOwnProperty.call(patternMatch, 'default') ? patternMatch['default'] : patternMatch;
    power = power && Object.prototype.hasOwnProperty.call(power, 'default') ? power['default'] : power;
    product = product && Object.prototype.hasOwnProperty.call(product, 'default') ? product['default'] : product;
    random = random && Object.prototype.hasOwnProperty.call(random, 'default') ? random['default'] : random;
    repeat = repeat && Object.prototype.hasOwnProperty.call(repeat, 'default') ? repeat['default'] : repeat;
    round = round && Object.prototype.hasOwnProperty.call(round, 'default') ? round['default'] : round;
    roundTo = roundTo && Object.prototype.hasOwnProperty.call(roundTo, 'default') ? roundTo['default'] : roundTo;
    statsOperator = statsOperator && Object.prototype.hasOwnProperty.call(statsOperator, 'default') ? statsOperator['default'] : statsOperator;
    stringMatch = stringMatch && Object.prototype.hasOwnProperty.call(stringMatch, 'default') ? stringMatch['default'] : stringMatch;
    substring = substring && Object.prototype.hasOwnProperty.call(substring, 'default') ? substring['default'] : substring;
    subtract = subtract && Object.prototype.hasOwnProperty.call(subtract, 'default') ? subtract['default'] : subtract;
    sum = sum && Object.prototype.hasOwnProperty.call(sum, 'default') ? sum['default'] : sum;
    truncate = truncate && Object.prototype.hasOwnProperty.call(truncate, 'default') ? truncate['default'] : truncate;

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
     * An OperatorProcessor process operands to gives you a result.
     * @typedef OperatorProcessor
     * @property {Object} expression - the expression definition
     * @property {Object} state - the session state (responses and variables)
     * @property {Object} preProcessor - helps you to parse and manipulate values
     * @property {Array<ProcessingValue>} operands - the operands
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
    var operators = {
        "and": and,
        "anyN": anyN,
        "containerSize": containerSize,
        "contains": contains,
        "customOperator": customOperator,
        "deletee": deletee,
        "divide": divide,
        "durationGTE": durationGTE,
        "durationLT": durationLT,
        "equal": equal,
        "equalRounded": equalRounded,
        "fieldValue": fieldValue,
        "gcd": gcd,
        "gt": gt,
        "gte": gte,
        "index": index,
        "inside": inside,
        "integerDivide": integerDivide,
        "integerModulus": integerModulus,
        "integerToFloat": integerToFloat,
        "isNull": isNull,
        "lcm": lcm,
        "lt": lt,
        "lte": lte,
        "match": match,
        "mathOperator": mathOperator,
        "max": max,
        "member": member,
        "min": min,
        "multiple": multiple,
        "not": not,
        "or": or,
        "ordered": ordered,
        "patternMatch": patternMatch,
        "power": power,
        "product": product,
        "random": random,
        "repeat": repeat,
        "round": round,
        "roundTo": roundTo,
        "statsOperator": statsOperator,
        "stringMatch": stringMatch,
        "substring": substring,
        "subtract": subtract,
        "sum": sum,
        "truncate": truncate
    };

    return operators;

});
