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
define(['taoQtiItem/apipCreator/api/authoringObject'], function(authoringObject){

    'use strict';

    function AccessElement(apipItem, node){
        authoringObject.init(this, apipItem, node);
    }

    /**
     * Find the related QtiElement object from the associated accessElement
     * 
     * @returns {Object}
     */
    AccessElement.prototype.getQtiElement = function getQtiElement(){
        return {};
    };

    /**
     * Remove an access element
     * For a matter of the model consitency, it should also call removeOrder() to remove the deleted accessElement properly
     * 
     * @returns {undefined}
     */
    AccessElement.prototype.remove = function remove(){
        //access elements may require some serial to make it easier to find
    };

    /**
     * Get the access element info related to an access element if it exists
     * 
     * @param {String} accessElementInfoType - possible values are spoken, brailleText, signing
     * @returns {Object} return the accessElementInfo object or null if not found
     */
    AccessElement.prototype.getAccessElementInfo = function getAccessElementInfo(accessElementInfoType){
        return {};
    };

    /**
     * Create an access element info from one of the available types
     * Available types are : spoken, brailleText, signing
     * 
     * @param {String} accessElementInfoType
     * @returns {Object} the newly created accessElementInfo
     */
    AccessElement.prototype.createAccessElementInfo = function createAccessElementInfo(accessElementInfoType){
        return {};
    };

    /**
     * Get the inclusion order(s) where the accessElement has been referenced
     * According to the standard, there could be 0 or more.
     * 
     * @returns {Array} get the array of insertionOrder type used 
     */
    AccessElement.prototype.getInclusionOrders = function getAssociatedInclusionOrders(){
        return [];
    };

    /**
     * Insert an existing access element in a insertionOrder identified by its type.
     * If the access element already exists in the insertionOrder, this will simply swtch the position.
     * 
     * @param {String} insertionOrderType
     * @param {Integer} order
     * @returns {Boolean} insertion success or not
     */
    AccessElement.prototype.setInclusionOrder = function setOrder(insertionOrderType, order){
        return true;
    };

    /**
     * Remove the accessElement from the given inclusionOrder (only)
     * Plan for a clever way : remove the accessElement when it is no longer used in any inclusion order
     * 
     * @param {Object} accessElement
     * @param {String} insertionOrderType
     * @returns {Boolean}
     */
    AccessElement.prototype.removeInclusionOrder = function removeOrder(insertionOrderType){
        return true;
    };

    return AccessElement;
});