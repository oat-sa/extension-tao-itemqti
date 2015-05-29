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
    function CreatorApi(apipItemXML){
        
        //apipItem is an private variable in this scope, which holds the authoring model
        var apipItem = parser.parse(apipItemXML);
        
        /**
         * Get a clone of the parsed item body
         * This will be used to generate the item view for the apip authoring tool
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
         * Find the related QtiElement object from the associated accessElement
         * 
         * @param {Object} accessElement
         * @returns {Object}
         */
        function getQtiElementByAccessElement(accessElement){
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
         * Get the access element(s) related to a qti element
         * According to the standard, there could more than one access element by qtiElement
         * 
         * @param {Object} qtiElement
         * @returns {Array} array of accessElement
         */
        function getAccessElementsByQtiElement(qtiElement){
            return [];
        }
        
        /**
         * Create an apip accessElement for a qti item body element
         * 
         * @param {Object} qtiElement
         * @returns {Object} the newly create apip access element
         */
        function createAccessElement(qtiElement){
            return {};
        }
        
        /**
         * Remove an access element
         * For a matter of the model consitency, it should also call removeOrder() to remove the deleted accessElement properly
         * 
         * @param {Object} accessElement
         * @returns {undefined}
         */
        function removeAccessElement(accessElement){
            //access elements may require some serial to make it easier to find
        }
        
        /**
         * Get the access element info related to an access element if it exists
         * 
         * @param {Object} accessElement
         * @param {String} accessElementInfoType - possible values are spoken, brailleText, signing
         * @returns {Object} return the accessElementInfo object or null if not found
         */
        function getAccessElementInfo(accessElement, accessElementInfoType){
            return {};
        }
        
        /**
         * Create an access element info from one of the available types
         * Available types are : spoken, brailleText, signing
         * 
         * @param {Object} accessElement
         * @param {String} accessElementInfoType
         * @returns {Object} the newly created accessElementInfo
         */
        function createAccessElementInfo(accessElement, accessElementInfoType){
            return {};
        }
        
        function removeAccessElementInfo(accessElementInfo){
            //access elementInfos may require some serial to make it easier to find
        }
        
        /**
         * Get the attribute value for the access element info
         * 
         * @param {Object} accessElementInfo
         * @param {String} name
         * @returns {Mixed}
         */
        function getAccessElementInfoAttribute(accessElementInfo, name){
            return;
        }
        
        /**
         * Set the attribute value for the access element info
         * 
         * @param {Object} accessElementInfo
         * @param {String} name
         * @param {Mixed} value
         * @returns {Object} the accessElementInfo itself for chaining
         */
        function setAccessElementInfoAttribute(accessElementInfo, name, value){
            return accessElementInfo;
        }
        
        /**
         * 
         * @param {accessElementInfo} accessElementInfo
         * @returns {accessElement}
         */
        function getAssociatedAccessElement(accessElementInfo){
            return {};
        }
        
        /**
         * Get the inclusion order(s) where the accessElement has been referenced
         * According to the standard, there could be 0 or more.
         * 
         * @param {Object} accessElement
         * @returns {Array} get the array of insertionOrder type used 
         */
        function getAssociatedInclusionOrders(accessElement){
            return [];
        }
        
        /**
         * Get the order of the qti element within the item body
         * This is used for inserting a new access element in one of the insertionOrder in a position that reflects the default one
         * 
         * @param {Object} qtiElement - the qtiElement object
         * @returns {Integer}
         */
        function getQtiElementNativeOrder(qtiElement){
            return -1;
        }
        
        /**
         * Insert an existing access element in a insertionOrder identified by its type.
         * If the access element already exists in the insertionOrder, this will simply swtch the position.
         * 
         * @param {Object} accessElement
         * @param {String} insertionOrderType
         * @param {Integer} order
         * @returns {Boolean} insertion success or not
         */
        function setOrder(accessElement, insertionOrderType, order){
            return true;
        }
        
        /**
         * Remove the accessElement from the given insertionOrder
         * 
         * @param {Object} accessElement
         * @param {String} insertionOrderType
         * @returns {Boolean}
         */
        function removeOrder(accessElement, insertionOrderType){
            return true;
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
            getQtiElementByAccessElement : getQtiElementByAccessElement,
            getAccessElementBySerial : getAccessElementBySerial,
            getAccessElementsByQtiElement : getAccessElementsByQtiElement,
            createAccessElement : createAccessElement,
            removeAccessElement : removeAccessElement,
            getAccessElementInfo : getAccessElementInfo,
            createAccessElementInfo : createAccessElementInfo,
            removeAccessElementInfo : removeAccessElementInfo,
            getAccessElementInfoAttribute : getAccessElementInfoAttribute,
            setAccessElementInfoAttribute : setAccessElementInfoAttribute,
            getAssociatedAccessElement : getAssociatedAccessElement,
            getAssociatedInclusionOrders : getAssociatedInclusionOrders,
            getQtiElementNativeOrder : getQtiElementNativeOrder,
            setOrder: setOrder,
            removeOrder: removeOrder,
            toXML : toXML
        };

    }
    
    return CreatorApi;
});