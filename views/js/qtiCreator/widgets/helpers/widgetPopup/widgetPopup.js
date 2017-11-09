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
    'i18n',
    'jquery',
    'ui/component',
    'ui/component/alignable',
    'ui/component/windowed',
    'tpl!taoQtiItem/qtiCreator/widgets/helpers/widgetPopup/popupControl'
], function (_, __, $, componentFactory, makeAlignable, makeWindowed, popupControlTpl) {
    'use strict';

    var windowClass = 'widget-popup';

    var eventNs = '.wigetpopup';

    var defaultConfig = {
        alignable: true,
        titleControls: {
            bin: false
        },
        popupControls: {
            done: false
        }
    };

    var titleControlsPresets = {
        bin: {
            id: 'delete',
            icon: 'bin',
            event: 'delete'
            // todo: add browser tooltip
        }
    };

    var popupControlsPresets = {
        done: {
            id: 'done',
            text: __('done'),
            event: 'done'
        }
    };

    var widgetPopupApi = {
        /**
         * Very basic popup control management for now.
         * If needed one day, this could be extended in a similar fashion as the controls of ui/component/windowed
         */
        renderPopupControls: function renderPopupControls() {
            var self = this,
                controlsEvents = {},
                control,
                $controlsArea = this.$popupControls;

            _.each(this.config.popupControls, function(isActive, controlId) {
                control = popupControlsPresets[controlId];

                if (isActive && control) {
                    $controlsArea.append($(popupControlTpl(control)));
                    controlsEvents[controlId] = control.event;
                }
            });

            // add behavior
            $controlsArea
                .off('click' + eventNs)
                .on('click' + eventNs, function(e) {
                    var controlId = $(e.target).data('control');
                    e.stopPropagation();

                    if (_.isString(controlsEvents[controlId])) {
                        self.trigger(controlsEvents[controlId]);
                    }
                });
        }
    };

    /**
     * @param {Object} specs - extra functions to extend the component
     * @param {Object} config
     * @param {Boolean} [config.alignable] - if the window should be alignable
     * @param {Object} [config.titleControls] - to activate default controls presets in the title bar
     */
    return function widgetPopupFactory(specs, config) {
        var widgetPopup;

        config = _.defaults(config || {}, defaultConfig);
        specs = _.defaults(specs || {}, widgetPopupApi);

        widgetPopup = componentFactory(specs, config);

        makeWindowed(widgetPopup);

        if (config.alignable) {
            makeAlignable(widgetPopup);
        }

        // add controls
        _.each(config.titleControls, function(isActive, controlId) {
            if (isActive && titleControlsPresets[controlId]) {
                widgetPopup.addControl(titleControlsPresets[controlId]);
            }
        });

        widgetPopup
            .on('render', function() {
                var $component = this.getElement();

                $component.addClass(windowClass);

                this.$popupControls = $('<div>', {
                    'class': 'widget-popup-controls-area'
                });
                $component.append(this.$popupControls);

                this.renderPopupControls();
            })
            .on('destroy', function() {
                var $controlsArea = this.$popupControls;

                $controlsArea.off(eventNs);
            });

        return widgetPopup;
    };

});