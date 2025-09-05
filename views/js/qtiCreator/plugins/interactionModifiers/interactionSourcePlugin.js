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

define([
    'jquery',
    'lodash',
    'core/plugin',
    'core/logger',
    'taoQtiItem/qtiCreator/plugins/interactionModifiers/interactionSourceHandler'
], function($, _, pluginFactory, loggerFactory, interactionSourceHandlerFactory) {
    'use strict';

    const logger = loggerFactory('taoQtiItem/qtiCreator/plugins/interactionModifiers/interactionSourcePlugin');

    /**
     * @returns {Object} the plugin
     */
    return pluginFactory({
        name: 'interactionSourcePlugin',

        /**
         * Initialize the plugin
         */
        init: function init() {
            try {
                this.handler = interactionSourceHandlerFactory({
                    itemCreator: this.getHost()
                });

                if (this.handler && typeof this.handler.init === 'function') {
                    this.handler.init();
                }

            } catch (err) {
                logger.error('Error initializing interactionSourcePlugin:', err);
            }

            return this;
        },

        /**
         * Destroy the plugin
         */
        destroy: function destroy() {
            if (this.handler) {
                this.handler.destroy();
                this.handler = null;
            }
        }
    });
});
