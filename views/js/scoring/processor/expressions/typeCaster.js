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
 * Helps to convert QTI types to native JS
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_){
    'use strict';

    /**
     * @type {Object.<string,function>}
     */
    var castingMap = {
            float: parseFloat,
            string: toString,
            integer: toInt,
            identifier: toString,
            pair: toPair,
            directedPair: toDirectedPair,
            duration: parseFloat,
            boolean: toBoolean
        },

        /**
         * Return transformation function based on required type
         * @exports taoQtiItem/scoring/processor/expressions/typeCaster
         *
         * @param {string} type
         * @returns {function}
         */
        typeCaster = function typeCast(type) {

            return (castingMap[type] || function (value) {
                return value;
            });
        };


    /**
     * Wrap parseInt. It can't be used unwrapped as a map callback
     * due to the radix parameter (that receives the index).
     * @private
     * @param value
     * @returns {Number}
     */
    function toInt(value){
        return parseInt(value, 10);
    }

    /**
     * Force creating string object, required for numeric types
     * @private
     * @param value
     * @returns {String}
     */
    function toString(value){
        return value.toString();
    }

    /**
     * @private
     * @param value
     * @returns {Array.<T>}
     */
    function toDirectedPair(value){
        if(_.isString(value) && value.indexOf(' ') > -1){
            return value.join(' ');
        }
        return _.toArray(value);
    }

    /**
     * @private
     * @param value
     * @returns {Array.<T>}
     */
    function toPair(value){
        return toDirectedPair(value).sort();
    }


    /**
     * @private
     * @param value
     * @returns {boolean}
     */
    function toBoolean(value){
        if(_.isString(value)){
            if(value === 'true' || value === '1'){
                return true;
            }
            if(value === 'false' || value === '0'){
                return false;
            }
        }
        return !!value;
    }

    return typeCaster;
});
