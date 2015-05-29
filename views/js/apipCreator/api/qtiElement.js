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

    function QtiElement(apipItem){
        authoringObject.init(this, apipItem);
    }

    /**
     * Get all the access element(s) related to a qti element
     * According to the standard, there could more than one access element by qtiElement
     * 
     * @returns {Array} array of accessElement
     */
    QtiElement.prototype.getAccessElements = function getAccessElements(){
        return [];
    };

    /**
     * Get the unique access element related to a qti element in a specific inclusionOrder
     * 
     * @returns {Array} array of accessElement
     */
    QtiElement.prototype.getAccessElementByInclusionOrder = function getAccessElementByInclusionOrder(inclusionOrderType){
        return {};
    };

    /**
     * Create an apip accessElement for a qti item body element
     * 
     * @returns {Object} the newly create apip access element
     */
    QtiElement.prototype.createAccessElement = function createAccessElement(){
        return {};
    };

    /**
     * Get the order of the qti element, in the order of appearance in the dom of the item body
     * This is used for inserting a new access element in one of the insertionOrder in a position that reflects the default one
     * 
     * @returns {Integer}
     */
    QtiElement.prototype.getNativeOrder = function getNativeOrder(){
        return -1;
    };

    return QtiElement;

});