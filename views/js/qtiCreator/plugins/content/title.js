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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA ;
 */

/**
 * This plugin displays the item label (from
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['lodash', 'i18n', 'core/plugin'], function (_, __, pluginFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({
        name: 'title',

        /**
         * Hook to the host's init
         */
        init() {
            const config = this.getHost().getConfig();
            const item = this.getHost().getItem();

            this.format = '%title%';
            if (config.properties && config.properties.translation) {
                this.format = __('%title% - Translation (%lang%)');
            }

            if (item && !_.isEmpty(item.attr('title'))) {
                this.title = item.attr('title');
            } else if (config && config.properties && config.properties.label) {
                this.title = config.properties.label;
            }
        },

        /**
         * Hook to the host's render
         */
        render() {
            const config = this.getHost().getConfig();
            if (this.title) {
                //attach the element to the title area
                this.getAreaBroker()
                    .getTitleArea()
                    .text(
                        this.format
                            .replace('%title%', this.title)
                            .replace('%lang%', config.properties.translationLanguageCode)
                    );
            }
        }
    });
});
