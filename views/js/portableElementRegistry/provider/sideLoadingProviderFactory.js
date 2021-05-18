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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 *
 */
define(function(){
    'use strict';

    /**
     * Generic portable element provider than loads portable elements directly on the client side
     *
     * Sample usage :
     * var pciProvider = sideLoadingProviderFactory(pciManifestArray);
     * pciProvider.add('anotherPciXYZ', anotherPciXYZObject);
     *
     */
    return function sideLoadingProviderFactory(portableElements){

        var _registry = portableElements;

        return {
            /**
             * Side load the portable element here
             * @param id
             * @param pathToManifest
             */
            add : function add(id, portableElement){
                _registry[id] = portableElement;
                return this;
            },
            /**
             * Implementation of the mandatory method load() of a portable element provider
             *
             * @returns {Promise} resolved when the added pci registered through their manifest are loaded
             */
            load : function load(){
                return _registry;
            }
        };
    };
});