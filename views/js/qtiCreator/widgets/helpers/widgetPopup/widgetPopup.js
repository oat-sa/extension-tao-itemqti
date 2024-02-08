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
    'ui/component/containable',
    'ui/component/windowed',
    'tpl!taoQtiItem/qtiCreator/widgets/helpers/widgetPopup/popupControl'
], function (_, __, $, componentFactory, makeAlignable, makeContainable, makeWindowed, popupControlTpl) {
    'use strict';

    var windowClass = 'widget-popup';

    var eventNs = '.wigetpopup';

    var defaultConfig = {
        alignable: false,
        containable: false,
        autoContain: true,
        popupControls: {
            done: false
        }
    };

    var popupControlsPresets = {
        done: {
            id: 'done',
            event: 'done',
            text: __('done'),
            description: __('Done')
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

            _.forEach(this.config.popupControls, function(isActive, controlId) {
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
        },

        /**
         * Ensure that the popup never goes out of the creator area
         */
        autoContain: function autoContain() {
            var $container;

            if (!this.config.areaBroker) {
                throw new Error('an areaBroker must be given to enable autoContain');
            }

            $container = this.config.areaBroker.getItemPanelArea();
            this.containIn($container, { padding: 10, paddingTop: 40 });
        }
    };

    /**
     * @param {Object} specs - extra functions to extend the component
     * @param {Object} config
     * @param {Boolean} [config.alignable] - if the window should be alignable
     * @param {Boolean} [config.containable] - if the window should be contained in its container
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
        if (config.containable) {
            makeContainable(widgetPopup);
        }

        widgetPopup
            .on('render', function() {
                var $component = this.getElement();

                $component.addClass(windowClass);

                this.$popupControls = $('<div>', {
                    'class': 'widget-popup-controls-area'
                });
                $component.append(this.$popupControls);

                this.renderPopupControls();

                if (config.containable && config.autoContain) {
                    this.autoContain();
                }
            })
            .on('destroy', function() {
                var $controlsArea = this.$popupControls;

                $controlsArea.off(eventNs);
            });

        return widgetPopup;
    };

});