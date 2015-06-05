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
define(
    [
        'jquery',
        'taoQtiItem/apipCreator/api/authoringObject',
        'taoQtiItem/apipCreator/api/accessElement'
    ], 
    function ($, authoringObject, AccessElement) {
        'use strict';

        function QtiElement(apipItem, node) {
            authoringObject.init(this, apipItem, node);
        }

        /**
         * Get all the access element(s) related to a qti element
         * According to the standard, there could more than one access element by qtiElement
         * 
         * @returns {Array} array of accessElement
         */
        QtiElement.prototype.getAccessElements = function getAccessElements() {
            var that = this,
                qtiElementId = this.data.getAttribute('id'),
                nodes = this.apipItem.xpath("//apip:accessElement[apip:contentLinkInfo/@qtiLinkIdentifierRef='" + qtiElementId + "']"),
                collection = [];
        
            $.each(nodes, function (key, node) {
                collection.push(new AccessElement(that.apipItem, node));
            });
            
            return collection;
        };

        /**
         * Get the unique access element related to a qti element in a specific inclusionOrder
         * 
         * @returns {Object} accessElement
         */
        QtiElement.prototype.getAccessElementByInclusionOrder = function getAccessElementByInclusionOrder(inclusionOrderType) {
            var that = this,
                accessElements = this.getAccessElements(),
                result = null;
                $.each(accessElements, function (key, accessElement) {
                    var identifier = accessElement.data.getAttribute('identifier'),
                        elementOrder = that.apipItem.xpath("//apip:" + inclusionOrderType + "/apip:elementOrder[@identifierRef='" + identifier + "']");
                    if (elementOrder.length) {
                        result = accessElement;
                    }
                });
                
            return result;
        };

        /**
         * Create an apip accessElement for a qti item body element
         * 
         * @returns {Object} the newly create apip access element
         */
        QtiElement.prototype.createAccessElement = function createAccessElement() {
            var that = this,
                accessElement = new AccessElement(that.apipItem);
        
            accessElement.addQtiElement(that);
            return accessElement;
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
    }
);