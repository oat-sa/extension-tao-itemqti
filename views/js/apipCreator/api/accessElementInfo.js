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
    'taoQtiItem/apipCreator/api/accessElementInfo/registry'
], function (_, authoringObject, registry) {
    'use strict';

    function AccessElementInfo(apipItem, node, accessElementInfoType, options) {
        this.pristine = false;
        if (!node) {
            this.pristine = true;
            node = this.createXMLNode(apipItem, accessElementInfoType, options);
        }
        authoringObject.init(this, apipItem, node);
    }

    /**
     * Create xml node of appropriate type.
     * @param {object} apipItem - ApipItem creator api instance {@link package-tao\taoQtiItem\views\js\apipCreator\api\apipItem.js}
     * @param {string} accessElementInfoType
     * @param {object} options
     * @returns {Object} created XML node
     */
    AccessElementInfo.prototype.createXMLNode = function createXMLNode(apipItem, accessElementInfoType, options) {
        return this.getImplementation(accessElementInfoType).createXMLNode(apipItem, options);
    };

    /**
     * Remove accessElementInfo node.
     * @returns {undefined}
     */
    AccessElementInfo.prototype.remove = function remove() {
        this.data.parentNode.removeChild(this.data);
    };

    /**
     * Set the attribute value for the access element
     * 
     * Allowed names listed in the <code>attributes</code> property of appropriate elementInfo implementation.
     * If node is not exists then will be attempt to create it (in case if <code>creator</code> function defined for attribute).
     * 
     * @param {String} name
     * @param {Mixed} value
     * @returns {Mixed}
     */
    AccessElementInfo.prototype.setAttribute = function (name, value) {
        var node = this.getAttributeNode(name),
            nameWithoutIndex = name.replace(/(\w+)(\[\d+\])?(.*)/, '$1$3'),
            nameParts = name.split('.'),
            attributes = this.getImplementation().attributes,
            result = null;

        if (attributes[nameWithoutIndex]) {
            if (!node && typeof attributes[nameWithoutIndex].creator === 'function') {
                attributes[nameWithoutIndex].creator(this, name);
                node = this.getAttributeNode(name);
            }
            
            if (node) {
                if (attributes[nameWithoutIndex].type === 'attribute') {
                    node.setAttribute(nameParts.pop(), value);
                } else {
                    node.innerHTML = value;
                }
                result = value;
            }
        }    

        return result;
    };

    /**
     * Get the attribute value
     * 
     * Allowed names listed in the <code>attributes</code> property of appropriate elementInfo implementation. 
     * 
     * @param {String} name
     * @returns {Mixed}
     */
     AccessElementInfo.prototype.getAttribute = function (name) {
        var node = this.getAttributeNode(name),
            nameWithoutIndex = name.replace(/(\w+)(\[\d+\])?(.*)/, '$1$3'),
            nameParts = name.split('.'),
            attributes = this.getImplementation().attributes,
            result = null;

        if (node) {
            if (attributes[nameWithoutIndex].type === 'attribute') {
                result = node.getAttribute(nameParts.pop());
            } else {
                result = node.innerHTML;
            }
        }

        return result;
    };
    
    /**
     * Remove the attribute value 
     * 
     * Allowed names listed in the <code>attributes</code> property of appropriate elementInfo implementation. 
     * 
     * @param {String} name
     * @returns {Mixed}
     */
     AccessElementInfo.prototype.removeAttribute = function removeAttribute(name) {
        var node = this.getAttributeNode(name),
            nameWithoutIndex = name.replace(/(\w+)(\[\d+\])?(.*)/, '$1$3'),
            nameParts = name.split('.'),
            attributes = this.getImplementation().attributes;

        if (node) {
            if (attributes[nameWithoutIndex].type === 'attribute') {
                node.removeAttribute(nameParts.pop());
            } else {
                node.parentNode.removeChild(node);
            }
        }
    };
    
    /**
     * Get number of attributes.
     * 
     * Allowed names listed in the <code>attributes</code> property of appropriate elementInfo implementation. 
     * 
     * @param {String} name
     * @returns {Mixed}
     */
    AccessElementInfo.prototype.getAttributeNum = function getAttributeNum(name) {
        var node,
            result = 0,
            xpath = '',
            attributes = this.getImplementation().attributes,
            nameParts = name.split('.');
    
        if (attributes[name]) {
            _.forEach(nameParts, function (val, num) {
                if ((num + 1) === nameParts.length && attributes[name].type === 'attribute') {//last part of path is attribute name
                    xpath += "[@" + val  + "]";
                } else { //part of path is node name
                    if (num !== 0) {
                        xpath += "/";
                    }
                    xpath += "apip:" + val;
                }
            });
            node = this.apipItem.xpath(xpath, this.data);
            result = node.length;
        }

        return result;
    };
    
    /**
     * Get attribute node by name. Attribute names listed in the <b>attributes</b> property of appropriate elementInfo implementation.
     * @param {type} name
     * @returns {unresolved}
     */
    AccessElementInfo.prototype.getAttributeNode = function (name) {
        var nameWithoutIndex = name.replace(/(\w+)(\[\d+\])?(.*)/, '$1$3'),
            node,
            result = null,
            xpath = '',
            attributes = this.getImplementation().attributes,
            nameParts = name.split('.');
    
        if (attributes[nameWithoutIndex]) {
            _.forEach(nameParts, function (val, num) {
                if ((num + 1) === nameParts.length && attributes[nameWithoutIndex].type === 'attribute') {//last part of path is attribute name
                    xpath += "[@" + val  + "]";
                } else { //part of path is node name
                    if (num !== 0) {
                        xpath += "/";
                    }
                    xpath += "apip:" + val;
                }
            });

            node = this.apipItem.xpath(xpath, this.data);
            result = node.length ? node[0] : null;
        }

        return result;
    };
    
    /**
     * Get the "parent" access element
     * 
     * @returns {accessElement}
     */
    AccessElementInfo.prototype.getAssociatedAccessElement = function getAssociatedAccessElement() {
        var node = this.apipItem.xpath("//*[@serial='" + this.serial + "']/ancestor::apip:accessElement");
        
        if (node.length) {
            return this.apipItem.getAccessElementBySerial(node[0].getAttribute('serial'));
        } else {
            return null;
        }
    };

    /**
     * Get the "parent" access element
     * 
     * @param {string} accessElementInfoType - Type of AccessElementInfo (e.g. 'spoken', 'signing')
     * @returns {accessElement}
     */
    AccessElementInfo.prototype.getImplementation = function getImplementation(accessElementInfoType) {
        accessElementInfoType = accessElementInfoType || this.data.localName;
        if (!registry[accessElementInfoType]) {
            throw new TypeError(accessElementInfoType + ' type is not supported.');
        }
        return registry[accessElementInfoType];
    };

    return AccessElementInfo;
});