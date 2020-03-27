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
 * Copyright (c) 2014-2020 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
define(function(){
    'use strict';

    //need a global reference to have pciHooks shared in two different requirejs context ("default" and "portableCustomInteraction")
    window._pciHooks = window._pciHooks || {};

    /**
     * Global object accessible by all PCIs
     *
     * @type Object
     */
    return {
        /**
         * register a custom interaction (its runtime model) in global registery
         * register a renderer
         * 
         * @param {Object} pciHook
         * @returns {undefined}
         */
        register : function(pciHook){
            var typeIdentifier = typeof pciHook.getTypeIdentifier === 'function' ? pciHook.getTypeIdentifier() : pciHook.typeIdentifier;
            if(typeIdentifier){
                window._pciHooks[typeIdentifier] = pciHook;
            }else{
                throw new Error('invalid PCI hook');
            }
        },
        /**
         * notify when a custom interaction is ready for test taker interaction
         * 
         * @param {string} pciInstance
         * @fires custominteractionready
         */
        notifyReady : function(pciInstance){
            //@todo add pciIntance as event data and notify event to delivery engine
        },
        /**
         * notify when a custom interaction is completed by test taker
         * 
         * @param {string} pciInstance
         * @fires custominteractiondone
         */
        notifyDone : function(pciInstance){
            //@todo add pciIntance as event data and notify event to delivery engine
        },

        onready : function onready(customInteraction, state){
            //to be implemented in future story
        },
        ondone : function ondone(customInteraction, response, state, status){
            //to be implemented in future story
        },

        /**
         * Get a cloned object representing the PCI model
         * 
         * @param {string} pciTypeIdentifier
         * @returns {Object} clonedPciModel
         */
        createPciInstance: function(pciTypeIdentifier) {
            var registeredPCI = window._pciHooks[pciTypeIdentifier];

            if (!registeredPCI) {
                throw new Error('no portable custom interaction hook found with the id ' + pciTypeIdentifier);
            }

            return Object.assign({}, registeredPCI);
        }
    };
});
