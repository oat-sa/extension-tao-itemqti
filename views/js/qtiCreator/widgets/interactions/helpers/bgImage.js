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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 *
 * @author dieter <dieter@taotesting.com>
 */
define([
    'ui/mediasizer'
], function () {
    'use strict';

    /**
     * @exports
     */

    /**
     * Handle images that are larger than the canvas
     *
     * @param widget
     */
    function handleOversizedImages(widget) {

        var $svg = widget.$original.find('.svggroup svg');
        var viewBox;
        var $bgImage = $svg.find('image');
        var trueSize = $bgImage[0].getBoundingClientRect();

        if(trueSize.width >= Number(widget.element.object.attr('width'))) {
            return;
        }

        // update model
        widget.element.object.attr('width', trueSize.width);
        widget.element.object.attr('height', trueSize.height);

        // change image attributes
        $bgImage[0].setAttribute('width', trueSize.width);
        $bgImage[0].setAttribute('height', trueSize.height);

        // change svg view box
        viewBox = $svg[0].getAttribute('viewBox').split(' ');
        viewBox[2] = trueSize.width;
        viewBox[3] = trueSize.height;
        $svg[0].setAttribute('viewBox', viewBox.join(' '));

      //  debugger
        $svg[0].setAttribute('width', trueSize.width);
        $svg[0].setAttribute('height', trueSize.height);

        $svg.parents('.main-image-box').css({ height: trueSize.height, width: trueSize.width });

        //widget.$original.trigger('resize.qti-widget.' + widget.serial, [trueSize.width]);
    }


    /**
     * Setup the background image
     *
     * @param widget
     */
    function setupImage(widget) {

        var $bgImage = widget.$original.find('.svggroup svg image');

        if (widget.$original.hasClass('responsive')) {
            return;
        }

        if (!!$bgImage.length) {
            // handle images larger than the canvas
            handleOversizedImages(widget);

            // setup media sizer
            setupMediaSizer(widget);
        }
    }

    /**
     * Setup media sizer when item has a fixed size
     *
     * @param widget
     * @returns {*}
     */
    function setupMediaSizer(widget) {

        var $mediaSizer = widget.$form.find('.media-sizer-panel');

        $mediaSizer.empty().mediasizer({
            target: widget.$original.find('.svggroup svg image'),
            showResponsiveToggle: false,
            showSync: false,
            responsive: false,
            parentSelector: widget.$original.attr('id'),
            applyToMedium: false,
            maxWidth: widget.element.object.attr('width')
        });

        $mediaSizer.on('sizechange.mediasizer', function (e, params) {

            widget.element.object.attr('width', params.width);
            widget.element.object.attr('height', params.height);

            widget.$original.trigger('resize.qti-widget.' + widget.serial, [params.width]);
        });
        return $mediaSizer;
    }


    /**
     * Object with callbacks that are common to all graphic interactions
     *
     * @param widget
     * @param formElement
     * @param callbacks, existing callbacks if any
     */
    function setChangeCallbacks(widget, formElement, callbacks) {

        callbacks = callbacks || {};
        callbacks.data = function (interaction, value) {
            interaction.object.attr('data', value);
            widget.rebuild({
                ready: function (widget) {
                    widget.changeState('question');
                }
            });
        };
        callbacks.width = function (interaction, value) {
            interaction.object.attr('width', value);
        };
        callbacks.height = function (interaction, value) {
            interaction.object.attr('height', value);
        };
        callbacks.type = function (interaction, value) {
            if (!value || value === '') {
                interaction.object.removeAttr('type');
            }
            else {
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
