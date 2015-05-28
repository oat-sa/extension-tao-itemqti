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
    'taoQtiItem/apipCreator/editor/accessElementInfo/registry',
    'taoQtiItem/apipCreator/helper/parser',
    'taoQtiItem/apipCreator/helper/'
], function(_, accessElementInfoRegistry, parser, serializer){

    /**
     * Instanciate an creator api that will works on an APIP authoring model
     * 
     * @param {String} apipItem - the APIP-QTI item XML
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
         * Get the access element related to a qti element if it exists
         * 
         * @param {Object} qtiElement
         * @returns {Object}
         */
        function getAccessElement(qtiElement){
            
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
         * @param {String} accessElementInfoType
         * @returns {Object}
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
         * Get the order of the qti element within the item body
         * This is to be used for inserting a new access element in one of the insertionOrder
         * 
         * @param {Object} qtiElement - the qtiElement object
         * @returns {Integer}
         */
        function getAccessElementNativeOrder(qtiElement){
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
            getAccessElement : getAccessElement,
            createAccessElement : createAccessElement,
            removeAccessElement : removeAccessElement,
            createAccessElementInfo : createAccessElementInfo,
            removeAccessElementInfo : removeAccessElementInfo,
            getAccessElementNativeOrder : getAccessElementNativeOrder,
            setOrder: setOrder,
            toXML : toXML
        };

    }
    
    return CreatorApi;
});