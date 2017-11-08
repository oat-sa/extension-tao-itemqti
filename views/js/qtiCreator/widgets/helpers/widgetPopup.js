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
    'ui/component/alignable',
    'ui/component/windowed'
], function (_, $, componentFactory, makeAlignable, makeWindowed) {
    'use strict';

    var defaultConfig = {
        alignable : true
    };

    /**
     * @param {Object} specs - extra functions to extend the component
     * @param {Object} config
     * @param {Boolean} config.alignable - if the window should be alignable
     */
    return function widgetPopupFactory(specs, config) {
        var widgetPopup;

        config = _.defaults(config || {}, defaultConfig);

        widgetPopup = componentFactory(specs, config);

        if (config.alignable) {
            makeAlignable(widgetPopup);
        }

        makeWindowed(widgetPopup);

        widgetPopup
            .on('render', function() {
                var $component = this.getElement();

                $component.addClass('widget-popup');
            });

        return widgetPopup;
    };

});