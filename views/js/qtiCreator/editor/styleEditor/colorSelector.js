define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/farbtastic/farbtastic'
], function ($, styleEditor) {
    'use strict'

    var colorSelector = function () {
        var colorPicker = $('#item-editor-color-picker'),
            target = colorPicker.data('target'),
            $target = $(target),
            widget = colorPicker.find('.color-picker'),
            widgetBox = colorPicker.find('.color-picker-container'),
            input = colorPicker.find('#color-picker-input'),
            resetButtons =  colorPicker.find('[data-role="color-picker-reset"]'),
            colorTriggers = colorPicker.find('.color-trigger'),
            currentProperty = 'color';


        colorTriggers.each(function() {
            var $trigger = $(this);
            $trigger.css('background', $target.css($trigger.data('value')))
                .on('click', function() {
                    currentProperty = $trigger.data('value');
                    widgetBox.show();
                });
        });

        widgetBox.on('click', function() {
            widgetBox.hide();
        });


        widget.farbtastic(function () {
            console.log(target, currentProperty, this.color)
            styleEditor.apply(target, currentProperty, this.color);
        });

        //widget.linkTo(input);

        resetButtons.on('click', function () {
            styleEditor.apply(target, $(this).data('value'));
        });
    };

    return colorSelector;
});

