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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA
 *
 */

/**
 *
 * Defines the item creator areas
 *
 * @example
 * var broker = areaBroker($container);
 * broker.defineAreas({
 *    content : $('.content', $container),
 *    //...
 * });
 * //then
 * var $content = broker.getArea('itemPanel');
 * var $content = broker.getItemPanelArea();
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['lodash', 'ui/areaBroker'], function (_, areaBroker) {
    'use strict';

    var requireAreas = [
        'menu',
        'menuLeft',
        'menuRight',
        'editorBar',
        'editorWrapper',
        'title',
        'toolbar',
        'interactionPanel',
        'itemPanel',
        'contentCreatorPanel',
        'propertyPanel',
        'itemPropertyPanel',
        'elementPropertyPanel',
        'itemStylePanel',
        'modalContainer'
    ];

    /**
     * Creates an area broker with the required areas for the item creator
     *
     * @see ui/areaBroker
     *
     * @param {jQueryElement|HTMLElement|String} $container - the main container
     * @param {Object} mapping - keys are the area names, values are jQueryElement
     * @returns {broker} the broker
     * @throws {TypeError} without a valid container
     */
    return _.partial(areaBroker, requireAreas);
});
