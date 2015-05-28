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
     * Get a short and descriptive view 
     * Something that can be served as a thumbnail
     * 
     * @returns {String} the rendered HTML
     */
    function getDescriptiveView(accessElementInfo){
        return 'this is a brailleText access element info';
    }

    /**
     * Get the renderer html form for the accessElementInfo 
     * 
     * @param {Object} accessElementInfo
     * @returns {String}
     */
    function getFormView(accessElementInfo){
        return '<form></form>';
    }

    /**
     * Set the attribute value for the signing access element
     * 
     * Allowed values are: 
     * - brailleTextString
     * 
     * @param {Object} accessElementInfo
     * @param {String} name
     * @param {Mixed} value
     * @returns {Mixed}
     */
    function setAttribute(accessElementInfo, name, value){
        return accessElementInfo;
    }
    
    /**
     * Get the attribute value for the signing access element
     * 
     * Allowed values are: 
     * - brailleTextString
     * 
     * @param {Object} accessElementInfo
     * @param {String} name
     * @returns {Mixed}
     */
    function getAttribute(accessElementInfo, name){
        return null;
    }

    return {
        typeId : 'brailleText',
        label : 'brailleText',
        getDescriptiveView : getDescriptiveView,
        getFormView : getFormView,
        setAttribute : setAttribute,
        getAttribute : getAttribute
    };
});