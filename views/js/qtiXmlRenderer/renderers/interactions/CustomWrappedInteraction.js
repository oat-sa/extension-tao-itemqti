/**
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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

define(['lodash'], function(_) {
    'use strict';

    /**
     * Apply custom wrapper to interactions during QTI XML rendering
     * @param {Object} interaction - The interaction to wrap
     * @param {String} interactionMarkup - The XML markup of the interaction
     * @returns {String} The wrapped interaction markup
     */
    function wrapInteraction(interaction, interactionMarkup) {
        let customWrapperClass = null;

        if (typeof interaction.attr === 'function') {
            customWrapperClass = interaction.attr('customWrapperClass');
        }

        if (!customWrapperClass && interaction && interaction.attributes && interaction.attributes.customWrapperClass) {
            customWrapperClass = interaction.attributes.customWrapperClass;
        }

        if (!customWrapperClass) {
            return interactionMarkup;
        }

        // We can't check the markup for existing wrappers as it doesn't include them
        // Instead, we check if we're in a re-rendering scenario where a wrapper might be added twice
        
        // Check if there's a flag indicating this interaction is already being wrapped
        if (interaction._wrapperBeingApplied) {
            // Avoid duplicate wrapper during recursive rendering
            return interactionMarkup;
        }
        
        // Set a temporary flag to avoid recursive wrapping
        interaction._wrapperBeingApplied = true;
        
        // Apply the wrapper
        const wrappedMarkup = `<div class="${customWrapperClass}">${interactionMarkup}</div>`;
        
        // Clear the flag after rendering
        setTimeout(() => {
            interaction._wrapperBeingApplied = false;
        }, 0);
        
        return wrappedMarkup;
    }

    return {
        wrapInteraction
    };
});
