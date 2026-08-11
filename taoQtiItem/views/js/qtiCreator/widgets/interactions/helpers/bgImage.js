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
 * Copyright (c) 2015-2023 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 *
 * @author dieter <dieter@taotesting.com>
 */
define(['util/url', 'util/image', 'ui/mediasizer'], function (url, imageUtil) {
    'use strict';
    /**
     * Setup the background image
     *
     * @param {Object} widget
     */
    function setupImage(widget) {
        const $bgImage = widget.$original.find('.svggroup svg image');

        if (widget.$original.hasClass('responsive')) {
            return;
        }

        if ($bgImage.length) {
            // TODO: This was removed becaus it is not likely needed after adjusting the svg.
            // It was left just in case an issue arrives and needs to be reinstated.
            // handle images larger than the canvas

            // setup media sizer
            setupMediaSizer(widget);
        }
    }

    /**
     * Setup media sizer when item has a fixed size
     *
     * @param {Object} widget
     * @returns {*}
     */
    function setupMediaSizer(widget) {
        const $mediaSizer = widget.$form.find('.media-sizer-panel');

        $mediaSizer.empty().mediasizer({
            target: widget.$original.find('.svggroup svg image'),
            showResponsiveToggle: false,
            showSync: false,
            responsive: false,
            parentSelector: widget.$original.attr('id'),
            applyToMedium: false,
            maxWidth: parseInt(widget.$original.width())
        });

        $mediaSizer.on('sizechange.mediasizer', function (e, params) {
            const width = parseInt(params.width, 10);
            const height = parseInt(params.height, 10);

            widget.element.object.attr('width', width);
            widget.element.object.attr('height', height);

            widget.$original.trigger(`resize.qti-widget.${widget.serial}`, [width, height]);
        });
        return $mediaSizer;
    }

    /**
     * Object with callbacks that are common to all graphic interactions
     *
     * @param {Object} widget
     * @param {JQElement} formElement
     * @param {Object} callbacks - existing callbacks if any
     */
    function setChangeCallbacks(widget, formElement, callbacks) {
        callbacks = callbacks || {};
        callbacks.data = function (interaction, value) {
            interaction.object.attr('data', url.encodeAsXmlAttr(value));
            imageUtil.getSize(widget.options.assetManager.resolve(value), function (size) {
                if (size) {
                    interaction.object.attr('width', size.width);
                    interaction.object.attr('height', size.height);
                }
                widget.rebuild({
                    ready: function (widgetReady) {
                        widgetReady.changeState('question');
                    }
                });
            });
        };
        callbacks.width = function (interaction, value) {
            interaction.object.attr('width', parseInt(value, 10));
        };
        callbacks.height = function (interaction, value) {
            interaction.object.attr('height', parseInt(value, 10));
        };
        callbacks.type = function (interaction, value) {
            if (!value || value === '') {
                interaction.object.removeAttr('type');
            } else {
                interaction.object.attr('type', value);
            }
        };

        formElement.setChangeCallbacks(widget.$form, widget.element, callbacks, { validateOnInit: false });
    }

    return {
        setupImage: setupImage,
        setChangeCallbacks: setChangeCallbacks
    };
});
