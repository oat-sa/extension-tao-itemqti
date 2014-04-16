define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, styleEditor) {
    'use strict'

    var colorSelector = function () {
        var colorPicker = $('#item-editor-color-picker'),
            target = colorPicker.data('target'),
            propertySelector = colorPicker.parent().find('[data-role="color-picker-property"]'),
            resetButton =  colorPicker.parent().find('[data-role="color-picker-reset"]');

        colorPicker.farbtastic(function () {
            styleEditor.apply(target, (propertySelector.val() || 'color'), this.color);
        });

        resetButton.on('click', function () {
            styleEditor.apply(target, propertySelector.val());
        });
    };

    return colorSelector;
});

