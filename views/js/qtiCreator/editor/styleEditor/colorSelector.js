define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, styleEditor) {
    'use strict'

    var colorSelector = function () {
        var colorPicker = $('#item-editor-color-picker'),
            target = colorPicker.data('target'),
            box = colorPicker.parent(),
            propertySelector = box.find('[data-role="color-picker-property"]'),
            input = box.find('#color-picker-input'),
            resetButton =  box.find('[data-role="color-picker-reset"]'),
            initialColor = $(target).css('background-color');

        colorPicker.farbtastic(function () {
            input.val(this.color + initialColor);
            console.log(this.color, initialColor);
            styleEditor.apply(target, (propertySelector.val() || 'color'), this.color);
        });

        resetButton.on('click', function () {
            styleEditor.apply(target, propertySelector.val());
        });
    };

    return colorSelector;
});

