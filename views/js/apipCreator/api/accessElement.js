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
    'taoQtiItem/apipCreator/api/authoringObject',
    'taoQtiItem/apipCreator/api/qtiElement',
    'taoQtiItem/apipCreator/api/accessElementInfo'
], function (_, authoringObject, QtiElement, AccessElementInfo) {
    'use strict';
    
    /**
     * accessElement constructor
     * @param {object} apipItem apipItem creator api instance 
     * @see {@link package-tao\taoQtiItem\views\js\apipCreator\api\apipItem.js}
     * @param {type} node XML element node. If not given then new empty node will be created and appended to the item XML.
     * @returns {object} AccessElement instance
     */
    function AccessElement(apipItem, node) {
        if (node === undefined) {
            node = this.createXMLNode(apipItem);
        }
        authoringObject.init(this, apipItem, node);
    }

    /**
     * Create accessElement xml node and append it to the item XML
     * @param {object} apipItem apipItem creator api instance 
     * @see {@link package-tao\taoQtiItem\views\js\apipCreator\api\apipItem.js}
     * @returns {Object} created XML node
     */
    AccessElement.prototype.createXMLNode = function createXMLNode(apipItem) {
        var accessElementNum = apipItem.xpath('//apip:accessElement').length,
            identifier,
            accessElementNode,
            accessibilityInfoNode,
            accessElementInfoNode = apipItem.createNode('apip', 'relatedElementInfo');

        do {
            accessElementNum++;
            identifier = 'ae' + accessElementNum;
        } while (apipItem.xpath("//apip:accessElement[@identifier='" + identifier + "']").length > 0);

        accessElementNode = apipItem.createNode(
            'apip',
            'accessElement',
            {"identifier" : ('ae' + accessElementNum)}
        );

        accessElementNode.appendChild(accessElementInfoNode);
        
        accessibilityInfoNode = apipItem.xpath('//apip:accessibilityInfo')[0];
        accessibilityInfoNode.appendChild(accessElementNode);
        
        return accessElementNode;
    };

    /**
     * Find the related QtiElements array from the associated accessElement
     * 
     * @returns {array}
     */
    AccessElement.prototype.getQtiElements = function getQtiElements() {
        var that = this,
            contentLinks = this.apipItem.xpath("//apip:accessElement[@serial='" + that.serial + "']/apip:contentLinkInfo"),
            result = [];
        
        _.forEach(contentLinks, function (link) {
            var node = that.apipItem.xpath("//*:itemBody//*[@id='" + link.getAttribute('qtiLinkIdentifierRef') + "']");

            if (node && node.length) {
                result.push(new QtiElement(this, node[0]));
            }
        });

        return result;
    };

    /**
     * Add related QtiElement to the accessElement (add <apip:contentLinkInfo> element)
     * 
     * @param {object} qtiElement QtiElement instance
     * @returns {Object} ceated <apip:contentLinkInfo> node
     */
    AccessElement.prototype.addQtiElement = function addQtiElement(qtiElement) {
        var that = this,
            qtiLinkIdentifierRef = qtiElement.data.getAttribute('id'),
            contentLinkInfo,
            accessElementInfoNode = that.apipItem.xpath("//apip:accessElement[@serial='" + that.serial + "']/apip:relatedElementInfo"),
            linkingMethodNode;

        if (!qtiLinkIdentifierRef) {
            do {
                qtiLinkIdentifierRef = qtiElement.data.localName + (new Date()).getTime();
            } while (that.apipItem.xpath("*:itemBody//*[@id='" + qtiLinkIdentifierRef + "']").length > 0);
            qtiElement.data.setAttribute('id', qtiLinkIdentifierRef);
        }

        contentLinkInfo = that.apipItem.createNode(
            'apip',
            'contentLinkInfo',
            {"qtiLinkIdentifierRef" : qtiElement.data.getAttribute('id')}
        );

        switch (qtiElement.data.localName) {
        case 'math':
            linkingMethodNode = that.apipItem.createNode('apip', 'objectLink');
            break;
        default:
            linkingMethodNode = that.apipItem.createNode('apip', 'textLink');
            linkingMethodNode.appendChild(that.apipItem.createNode('apip', 'fullString'));
            break;
        }

        contentLinkInfo.appendChild(linkingMethodNode);
        that.data.insertBefore(contentLinkInfo, accessElementInfoNode[0]);

        return contentLinkInfo;
    };

    /**
     * Remove an access element
     * For a matter of the model consistency, it should also call removeOrder() to remove the deleted accessElement properly
     * 
     * @returns {undefined}
     */
    AccessElement.prototype.remove = function remove() {
        this.removeInclusionOrder();
        this.data.parentNode.removeChild(this.data);
    };

    /**
     * Get the access element info related to an access element if it exists
     * 
     * @param {String} accessElementInfoType - possible values are spoken, brailleText, signing. If not given all types will be returned.
     * @returns {Array} list of accessElementInfo objects or null if not found
     */
    AccessElement.prototype.getAccessElementInfo = function getAccessElementInfo(accessElementInfoType) {
        var that = this,
            result = [],
            accessElementInfoNodes = this.apipItem.xpath("apip:relatedElementInfo/*", this.data);

        _.forEach(accessElementInfoNodes, function (accessElementInfoNode) {
            if (!accessElementInfoType || accessElementInfoType === accessElementInfoNode.localName) {
                result.push(new AccessElementInfo(that.apipItem, accessElementInfoNode));
            }
        });

        return result.length === 0 ? null : result;
    };

    /**
     * Create an access element info from one of the available types
     * Available types are : spoken, brailleText, signing
     * 
     * @param {String} accessElementInfoType
     * @param {object} options
     * @returns {Object} the newly created accessElementInfo
     */
    AccessElement.prototype.createAccessElementInfo = function createAccessElementInfo(accessElementInfoType, options) {
        var that = this,
            elementInfo = new AccessElementInfo(that.apipItem, null, accessElementInfoType, options),
            relatedElementInfoNode = this.apipItem.xpath("apip:relatedElementInfo", this.data)[0];

        relatedElementInfoNode.appendChild(elementInfo.data);
        return elementInfo;
    };

    /**
     * Get the inclusion order(s) where the accessElement has been referenced
     * According to the standard, there could be 0 or more.
     * 
     * @returns {Array} get the array of insertionOrder type used 
     */
    AccessElement.prototype.getInclusionOrders = function getAssociatedInclusionOrders() {
        var identifier = this.data.getAttribute('identifier'),
            result = [],
            inclusionOrders = this.apipItem.xpath("//apip:elementOrder[@identifierRef='" + identifier + "']");

        _.forEach(inclusionOrders, function (inclusionOrder) {
            result.push(inclusionOrder.parentNode.localName);
        });
        return result;
    };

    /**
     * Insert an existing access element in a insertionOrder identified by its type.
     * If the access element already exists in the insertionOrder, this will simply swtch the position.
     * 
     * @param {String} insertionOrderType
     * @param {Integer} order
     * @returns {undefined}
     */
    AccessElement.prototype.setInclusionOrder = function setOrder(insertionOrderType, order) {
        var that = this,
            identifier = this.data.getAttribute('identifier'),
            elementOrderNode = this.apipItem.xpath("//apip:" + insertionOrderType + "/apip:elementOrder[@identifierRef='" + identifier + "']"),
            orderNode = that.apipItem.createNode('apip', 'order'),
            inclusionOrderTypeNode;

        orderNode.innerHTML = order;

        if (elementOrderNode.length === 0) {
            inclusionOrderTypeNode = this.apipItem.xpath("//apip:" + insertionOrderType);

            if (inclusionOrderTypeNode.length === 0) {
                inclusionOrderTypeNode = that.apipItem.createNode('apip', insertionOrderType);
                this.apipItem.xpath("//apip:inclusionOrder")[0].appendChild(inclusionOrderTypeNode);
            } else {
                inclusionOrderTypeNode = inclusionOrderTypeNode[0];
            }
            elementOrderNode = that.apipItem.createNode('apip', 'elementOrder', {identifierRef : identifier});
            inclusionOrderTypeNode.appendChild(elementOrderNode);
        } else {
            elementOrderNode = elementOrderNode[0];
        }

        elementOrderNode.innerHTML = '';
        elementOrderNode.appendChild(orderNode);
    };

    /**
     * Remove the accessElement from the given inclusionOrder (only)
     * Plan for a clever way : remove the accessElement when it is no longer used in any inclusion order
     * 
     * @param {String} insertionOrderType if not given all types will be removed.
     * @returns {undefined}
     */
    AccessElement.prototype.removeInclusionOrder = function removeOrder(insertionOrderType) {
        var parentNodeName = insertionOrderType ? 'apip:' + insertionOrderType : '*',
            identifier = this.data.getAttribute('identifier'),
            inclusionOrderNodes = this.apipItem.xpath("//" + parentNodeName + "/apip:elementOrder[@identifierRef='" + identifier + "']");

        _.each(inclusionOrderNodes, function (inclusionOrderNode) {
            inclusionOrderNode.parentNode.removeChild(inclusionOrderNode);
        });
    };

    return AccessElement;
});