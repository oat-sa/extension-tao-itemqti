define([
    'jquery',
    'farbtastic',
    'taoQtiItem/qtiCreator/editor/styleEditor'
], function ($, farbtastic, styleEditor) {
    'use strict'

    var colorSelector = function (selector) {
        var colorPicker = $(selector),
            target = colorPicker.data('target'),
            $target = $(target),
            oldValues = {
                'background-color': $target.css('background-color'),
                color: $target.css('color')
            },
            propertySelector = colorPicker.parent().find('[data-role="color-picker-property"]'),
            reset = function (property) {
                if (!oldValues[property]) {
                    return false;
                }
                styleEditor.apply(target, property, oldValues[property]);
            };

        colorPicker.farbtastic(function () {
            styleEditor.apply(target, (propertySelector.val() || 'color'), this.color);
        });

        // unused but usable
        return {
            resetBackgroundColor: function () {
                reset('background-color');
            },
            resetColor: function () {
                reset('color');
            }
        }
    };

    return colorSelector;
});

