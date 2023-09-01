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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'ui/component',
    'ui/component/draggable',
    'ui/component/resizable',
    'ui/component/stackable',
    'ui/component/windowed'
], function (_, $, componentFactory, makeDraggable, makeResizable, makeStackable, makeWindowed) {
    'use strict';

    var defaultConfig = {
        draggable: true,
        resizable: true,
        resizableEdges: { top: true, right: true, bottom: true, left: true }
    };

    /**
     * @param {Object} specs - extra functions to extend the component
     * @param {Object} config
     * @param {Boolean} config.draggable - if the window should be draggable
     * @param {Boolean} config.resizable - if the window should be resizable
     * @param {Object} config.resizableEdges - which edges should be resizable (interactjs)
     */
    return function windowPopupFactory(specs, config) {
        var windowPopup;

        config = _.defaults(config || {}, defaultConfig);

        windowPopup = componentFactory(specs, config);

        if (config.draggable) {
            makeDraggable(windowPopup);
        }
        if (config.resizable) {
            makeResizable(windowPopup, { edges: config.resizableEdges });
        }
        makeStackable(windowPopup, { stackingScope: 'qti-creator' });
        makeWindowed(windowPopup);

        windowPopup
            .on('render', function() {
                var $component = this.getElement();

                $component.addClass('window-popup');
            });

        return windowPopup;
    };

});