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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin tracks item changes and prevents you to loose them.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'core/plugin',
    'taoQtiItem/qtiCreator/helper/changeTracker'
], function (pluginFactory, changeTrackerFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name: 'changeTracker',

        /**
         * Hook to the host's init
         */
        init() {
            const itemCreator = this.getHost();
            const $container = this.getAreaBroker().getContainer();
            this.changeTracker = changeTrackerFactory($container.get(0), itemCreator, '.content-wrap');
        },

        /**
         * Plugin destroy cycle
         */
        destroy() {
            if (this.changeTracker) {
                this.changeTracker.uninstall();
                this.changeTracker = null;
            }
        }
    });
});
