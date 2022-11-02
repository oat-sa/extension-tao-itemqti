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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'jquery',
    'lib/farbtastic/farbtastic'
], function (stateFactory, Question, $) {
    const CustomInteractionStateQuestion = stateFactory.extend(Question);

    CustomInteractionStateQuestion.prototype.initColorPickers = function () {
        const $colorTriggers = this.widget.$form.find('.color-trigger:not([data-color-picker=initialized])');

        $colorTriggers.each(function () {
            const $colorTrigger = $(this),
                $input = $colorTrigger.siblings('input'),
                color = $input.val();

            //set color recorded in the hidden input to the color trigger
            $colorTrigger.css('background-color', color);
        });

        $colorTriggers.on('click.color-picker', function () {
            const $colorTrigger = $(this),
                $context = $colorTrigger.closest('.item-editor-color-picker'),
                $container = $context.find('.color-picker-container').show(),
                $colorPicker = $container.find('.color-picker'),
                $colorPickerInput = $container.find('.color-picker-input'),
                $input = $colorTrigger.siblings('input[type="hidden"]'),
                color = $input.val(),
                $itemEditorWidgetBar = $('#item-editor-item-widget-bar');

            $container.css({
                right: $itemEditorWidgetBar.width() + 2,
                top: $colorTrigger.offset().top - $container.width() / 2
            });

            // Init the color picker
            $colorPicker.farbtastic('.color-picker-input', $context);

            // Set the color to the currently set on the form init
            $colorPickerInput.val(color).trigger('keyup');

            // Populate the input with the color on quitting the modal
            $container
                .find('.closer')
                .off('click')
                .on('click', function () {
                    $container.hide();
                    $colorPicker.off('.farbtastic');
                });

            //listen to color change
            $colorPicker.off('.farbtastic').on('colorchange.farbtastic', function (e, color) {
                $colorTrigger.css('background-color', color);
                $input.val(color).trigger('change');
            });
        });

        $colorTriggers.attr('data-color-picker', 'initialized');
    };

    CustomInteractionStateQuestion.prototype.destroyColorPickers = function () {
        const $colorTriggers = this.widget.$form.find('.color-trigger');
        $colorTriggers.off('.color-picker');
        $colorTriggers.removeAttr('data-color-picker');
    };

    return CustomInteractionStateQuestion;
});
