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
    'taoQtiItem/apipCreator/helper/serializer'
], function(_, parser, serializer){

    'use strict';

    /**
     * Instanciate an creator api that will works on an APIP authoring model
     * 
     * @param {String} apipItemXML - the APIP-QTI item XML
     * @returns {Object}
     */
    function ApipItem(apipItemXML){
        this.apipItem = parser.parse(apipItemXML);
    }

    /**
     * Get a clone of the parsed item body
     * This will be used to generate the (main) item selecting view for the apip authoring tool
     * 
     * @returns {Object}
     */
    ApipItem.prototype.getItemBodyModel = function getItemBodyModel(){
        return _.cloneDeep(this.apipItem.itemBody);
    };

    /**
     * Find the qti element identified by its serial
     * 
     * @param {String} qtiElementSerial
     * @returns {Object}
     */
    ApipItem.prototype.getQtiElementBySerial = function getQtiElementBySerial(qtiElementSerial){
        return {};
    };

    /**
     * Get the access element identified by its serial
     * 
     * @param {String} accessElementSerial
     * @returns {Object}
     */
    ApipItem.prototype.getAccessElementBySerial = function getAccessElementBySerial(accessElementSerial){
        return {};
    };

    /**
     * Get the sorted array of accessElements referenced in the inclusion order
     * The accessElements are sorted according to the order attribute in the inclusionOrder
     * 
     * @param {String} inclusionOrderType
     * @returns {Array}
     */
    ApipItem.prototype.getAccessElementsByInclusionOrder = function getAccessElementsByInclusionOrder(inclusionOrderType){
        return [];
    };

    /**
     * Serialize the authoring model into XML for saving
     * 
     * @returns {String}
     */
    ApipItem.prototype.createAccessElementInfo = function toXML(){
        return serializer.serialize(this.apipItem);
    };

    return ApipItem;
});