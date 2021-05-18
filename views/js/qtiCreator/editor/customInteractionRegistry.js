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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/portableElementRegistry/ciRegistry'
], function(ciRegistry){
    "use strict";

    console.warn('deprected use of "taoQtiItem/qtiCreator/editor/customInteractionRegistry", please use "taoQtiItem/portableElementRegistry/ciRegistry" now');

    return {
        get : function get(id){
            var portableElement = {};
            console.warn('deprected use of "taoQtiItem/qtiCreator/editor/customInteractionRegistry::get()", please use "taoQtiItem/portableElementRegistry/ciRegistry::get()" now');
            portableElement.manifest = ciRegistry.get(id);
            return portableElement;
        },
        getBaseUrl : function getBaseUrl(id){
            console.warn('deprected use of "taoQtiItem/qtiCreator/editor/customInteractionRegistry::getBaseUrl()", please use "taoQtiItem/portableElementRegistry/ciRegistry::getBaseUrl()" now');
            return this.get(id).manifest.baseUrl;
        }
    }
});