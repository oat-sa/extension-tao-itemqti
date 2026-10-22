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
 * Expose all operators processors
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import and from 'taoQtiItem/scoring/processor/expressions/operators/and';
import anyN from 'taoQtiItem/scoring/processor/expressions/operators/anyN';
import containerSize from 'taoQtiItem/scoring/processor/expressions/operators/containerSize';
import contains from 'taoQtiItem/scoring/processor/expressions/operators/contains';
import customOperator from 'taoQtiItem/scoring/processor/expressions/operators/customOperator';
import deletee from 'taoQtiItem/scoring/processor/expressions/operators/delete';
import divide from 'taoQtiItem/scoring/processor/expressions/operators/divide';
import durationGTE from 'taoQtiItem/scoring/processor/expressions/operators/durationGTE';
import durationLT from 'taoQtiItem/scoring/processor/expressions/operators/durationLT';
import equal from 'taoQtiItem/scoring/processor/expressions/operators/equal';
import equalRounded from 'taoQtiItem/scoring/processor/expressions/operators/equalRounded';
import fieldValue from 'taoQtiItem/scoring/processor/expressions/operators/fieldValue';
import gcd from 'taoQtiItem/scoring/processor/expressions/operators/gcd';
import gt from 'taoQtiItem/scoring/processor/expressions/operators/gt';
import gte from 'taoQtiItem/scoring/processor/expressions/operators/gte';
import index from 'taoQtiItem/scoring/processor/expressions/operators/index';
import inside from 'taoQtiItem/scoring/processor/expressions/operators/inside';
import integerDivide from 'taoQtiItem/scoring/processor/expressions/operators/integerDivide';
import integerModulus from 'taoQtiItem/scoring/processor/expressions/operators/integerModulus';
import integerToFloat from 'taoQtiItem/scoring/processor/expressions/operators/integerToFloat';
import isNull from 'taoQtiItem/scoring/processor/expressions/operators/isNull';
import lcm from 'taoQtiItem/scoring/processor/expressions/operators/lcm';
import lt from 'taoQtiItem/scoring/processor/expressions/operators/lt';
import lte from 'taoQtiItem/scoring/processor/expressions/operators/lte';
import match from 'taoQtiItem/scoring/processor/expressions/operators/match';
import mathOperator from 'taoQtiItem/scoring/processor/expressions/operators/mathOperator';
import max from 'taoQtiItem/scoring/processor/expressions/operators/max';
import member from 'taoQtiItem/scoring/processor/expressions/operators/member';
import min from 'taoQtiItem/scoring/processor/expressions/operators/min';
import multiple from 'taoQtiItem/scoring/processor/expressions/operators/multiple';
import not from 'taoQtiItem/scoring/processor/expressions/operators/not';
import or from 'taoQtiItem/scoring/processor/expressions/operators/or';
import ordered from 'taoQtiItem/scoring/processor/expressions/operators/ordered';
import patternMatch from 'taoQtiItem/scoring/processor/expressions/operators/patternMatch';
import power from 'taoQtiItem/scoring/processor/expressions/operators/power';
import product from 'taoQtiItem/scoring/processor/expressions/operators/product';
import random from 'taoQtiItem/scoring/processor/expressions/operators/random';
import repeat from 'taoQtiItem/scoring/processor/expressions/operators/repeat';
import round from 'taoQtiItem/scoring/processor/expressions/operators/round';
import roundTo from 'taoQtiItem/scoring/processor/expressions/operators/roundTo';
import statsOperator from 'taoQtiItem/scoring/processor/expressions/operators/statsOperator';
import stringMatch from 'taoQtiItem/scoring/processor/expressions/operators/stringMatch';
import substring from 'taoQtiItem/scoring/processor/expressions/operators/substring';
import subtract from 'taoQtiItem/scoring/processor/expressions/operators/subtract';
import sum from 'taoQtiItem/scoring/processor/expressions/operators/sum';
import truncate from 'taoQtiItem/scoring/processor/expressions/operators/truncate';

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
export default {
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
