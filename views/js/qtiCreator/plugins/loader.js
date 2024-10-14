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
 * The plugin loader with the "required" plugins
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'core/pluginLoader',
    'taoQtiItem/qtiCreator/plugins/menu/save',
    'taoQtiItem/qtiCreator/plugins/menu/preview',
    'taoQtiItem/qtiCreator/plugins/menu/print',
    'taoQtiItem/qtiCreator/plugins/content/title',
    'taoQtiItem/qtiCreator/plugins/content/changeTracker',
    'taoQtiItem/qtiCreator/plugins/panel/outcomeEditor',
    'taoQtiItem/qtiCreator/plugins/panel/itemViewer'
], function (pluginLoader, save, preview, print, title, changeTracker, outcomeEditor, itemViewer) {
    'use strict';

    /**
     * Instantiate the plugin loader with all the required plugins configured
     */
    return pluginLoader({
        menu: [save, preview, print],
        content: [title, changeTracker],
        panel: [outcomeEditor, itemViewer]
    });
});
