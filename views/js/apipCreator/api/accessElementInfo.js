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
    'taoQtiItem/apipCreator/api/authoringObject',
    'taoQtiItem/apipCreator/api/accessElementInfo/registry'
], function(authoringObject, registry){

    'use strict';

    function AccessElementInfo(apipItem){
        authoringObject.init(this, apipItem);
    }

    AccessElementInfo.prototype.remove = function remove(){
        //access elementInfos may require some serial to make it easier to find
    };

    /**
     * Get the attribute value for the access element info
     * 
     * @param {Object} accessElementInfo
     * @param {String} name
     * @returns {Mixed}
     */
    AccessElementInfo.prototype.getAttribute = function getAttribute(name){
        return;
    };

    /**
     * Set the attribute value for the access element info
     * 
     * @param {Object} accessElementInfo
     * @param {String} name
     * @param {Mixed} value
     * @returns {Object} the accessElementInfo itself for chaining
     */
    AccessElementInfo.prototype.setAttribute = function setAttribute(name, value){
        return this;
    };

    /**
     * Get the "parent" access element
     * 
     * @returns {accessElement}
     */
    AccessElementInfo.prototype.getAssociatedAccessElement = function getAssociatedAccessElement(){
        return {};
    };

    return AccessElementInfo;
});