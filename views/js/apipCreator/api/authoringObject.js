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
define([], function(){
    'use strict';
    
    /**
     * Initialize authoring object (e.g. Access Element or QtiElement instances).
     * 
     * @param {object} instance - Authoring object
     * @param {object} apipItem - Apip item instance {@link '/taoQtiItem/views/js/apipCreator/api/apipItem.js'}
     * @param {domElement} node - XML node
     * @returns {object} initialized authoring object
     */
    function init(instance, apipItem, node) {
        instance.apipItem = apipItem;
        instance.data = node;
        instance.serial = node.getAttribute('serial');
        instance.getAttribute = function getAttribute(name){
            return node.getAttribute(name);
        };
        return instance;
    }
    
    return {
        init : init
    };
});