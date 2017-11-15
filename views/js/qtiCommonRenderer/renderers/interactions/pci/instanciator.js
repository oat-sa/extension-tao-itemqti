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
 * Copyright (c) 2017 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
define(['qtiCustomInteractionContext'], function(qtiCustomInteractionContext){
    'use strict';
    return {
        /**
         * Get the PCI instance associated to the interaction object
         * If none exists, create a new one based on the PCI typeIdentifier
         *
         * @param {Object} interaction - the js object representing the interaction
         * @returns {Object} PCI instance
         */
        getPci : function getPci(interaction){

            var pciTypeIdentifier,
                pci = interaction.data('pci');

            if(!pci){
                pciTypeIdentifier = interaction.typeIdentifier;
                pci = qtiCustomInteractionContext.createPciInstance(pciTypeIdentifier);
                if(pci){
                    //binds the PCI instance to TAO interaction object and vice versa
                    interaction.data('pci', pci);
                    pci._taoCustomInteraction = interaction;
                }else{
                    throw new Error('no custom interaction hook found for the type ' + pciTypeIdentifier);
                }
            }

            return pci;
        }
    };
});