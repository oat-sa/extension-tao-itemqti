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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'taoQtiItem/apipCreator/helper/parser',
    'taoQtiItem/apipCreator/helper/'
], function(_, parser, serializer){

    'use strict';

    /**
     * Instanciate an creator api that will works on an APIP authoring model
     * 
     * @param {String} apipItemXML - the APIP-QTI item XML
     * @returns {Object}
     */
    function ApipItem(apipItemXML){

        //apipItem is an private variable in this scope, which holds the authoring model
        var apipItem = parser.parse(apipItemXML);

        /**
         * Get a clone of the parsed item body
         * This will be used to generate the (main) item selecting view for the apip authoring tool
         * 
         * @returns {Object}
         */
        function getItemBodyModel(){
            return _.cloneDeep(apipItem.itemBody);
        }

        /**
         * Find the qti element identified by its serial
         * 
         * @param {String} qtiElementSerial
         * @returns {Object}
         */
        function getQtiElementBySerial(qtiElementSerial){
            return {};
        }

        /**
         * Get the access element identified by its serial
         * 
         * @param {String} accessElementSerial
         * @returns {Object}
         */
        function getAccessElementBySerial(accessElementSerial){
            return {};
        }

        /**
         * Serialize the authoring model into XML for saving
         * 
         * @returns {String}
         */
        function toXML(){
            return serializer.serialize(apipItem);
        }

        return {
            getItemBodyModel : getItemBodyModel,
            getQtiElementBySerial : getQtiElementBySerial,
            getAccessElementBySerial : getAccessElementBySerial,
            toXML : toXML
        };

    }

    return ApipItem;
});