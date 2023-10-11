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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'nouislider'
], function ($, styleEditor) {
    'use strict';

    /**
     * Adapt the image editor to the target screen the students will be using
     * @param {Object} item - the current item
     */
    var itemResizer = function (item) {

        var itemResizer = $('#item-editor-item-resizer'),
            target = itemResizer.data('target'),
            $target = $(target),
            targetWidth = $target.innerWidth(),
            itemWidthPrompt = itemResizer.find('[name="item-width-prompt"]'),
            sliderBox = itemResizer.find('.slider-box'),
            slider = itemResizer.find('#item-editor-item-resizer-slider'),
            input = $('#item-editor-item-resizer-text'),
            resetButton =  itemResizer.find('[data-role="item-width-reset"]'),
            sliderSettings = {
                range : {
                    min: Math.min(768, targetWidth),
                    max: Math.max(1200, targetWidth)
                },
                start: targetWidth
            };

        var reset = function() {
            itemResizer.find('[value="no-slider"]').trigger('click');
        };

        /**
         * Resize item
         *
         * @param val int|string
         */
        var resizeItem = function(val) {
            if (val) {
                // to make sure the value can come as int or string
                val = parseInt(val).toString() + 'px';
                styleEditor.apply(target, 'width', val);
                styleEditor.apply(target, 'max-width', 'none');
            } else {
                styleEditor.apply(target, 'width');
                styleEditor.apply(target, 'max-width');
            }

            item.data('widget').$container.trigger('resize.itemResizer');
        };

        /**
         * Initialize radio buttons
         */
        itemWidthPrompt.on('click', function() {
            // user intends to resize the item
            if(this.value === 'slider') {
                input.val($target.width());
                slider.val($target.width()).trigger('slide');
                sliderBox.slideDown();

                item.data('responsive', false);

                resizeItem($target.width());
            }
            // user wants to use default
            else {
                input.val('');
                slider.val(sliderSettings.start);
                sliderBox.slideUp();

                item.data('responsive', true);

                resizeItem();
            }
        });


        slider.noUiSlider(sliderSettings);
        slider.on('slide', function() {
            var value = Math.round(slider.val());
            input.val(value);
            resizeItem(value);
        });

        input.on('keydown', function(e) {
            var c = e.keyCode;
            return ([8, 37, 39, 46].includes(c)
                || (c >= 48 && c <= 57)
                || (c >= 96 && c <= 105));
        });

        input.on('blur', function() {
            resizeItem(this.value);
        });

        resetButton.on('click', reset);
        $(document).on('customcssloaded.styleeditor', function(e, style) {
            var width;
            // make a proper width change
            if(style[target] && style[target].width) {
                width = parseInt(style[target].width, 10);
                input.val(width);
                slider.val(width);
                itemResizer.find('[value="slider"]').trigger('click');
            }
            // just fill the text field
            else {
                input.val($target.width());
            }
        });
    };
    return itemResizer;
});
