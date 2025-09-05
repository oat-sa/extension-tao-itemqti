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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA ;
 */

define([], function () {
    'use strict';

    /**
     * Before inserting Figure widget, check if parent element supports it.
     * If supported, image wrap will be implemented as `<figure class="wrap-right"><img></figure>`.
     * If not supported, image wrap will be implemented as `<img class="wrap-right">`
     * @param {JQuery} $container
     * @returns {boolean}
     */
    const isFigureSupportedInParent = ($container) => {
        const notSupported =  (
            $container.closest('.qti-choice, .qti-flow-container').length ||
            $container.closest('.qti-table caption').length ||
            $container.closest('.qti-modalFeedback').length ||
            ($container.closest('.qti-customInteraction').length && !$container.closest('[data-element-support-figure="true"]').length)
        );
        return !notSupported;
    };

    return {
        isFigureSupportedInParent
    };
});
